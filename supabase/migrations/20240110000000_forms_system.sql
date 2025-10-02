-- MÓDULO DE FORMULARIOS: Sistema unificado de formularios
-- Migration: 20240110000000_forms_system.sql

-- 1. ACTUALIZAR recruitment_forms para agregar form_type
ALTER TABLE public.recruitment_forms
ADD COLUMN IF NOT EXISTS form_type VARCHAR(50) DEFAULT 'recruitment';

-- Agregar comentario sobre los tipos disponibles
COMMENT ON COLUMN public.recruitment_forms.form_type IS 'Tipos: recruitment, leave_request';

-- 2. CREAR TABLA DE ENVÍOS DE AUSENCIAS (leave_submissions)
CREATE TABLE IF NOT EXISTS public.leave_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id UUID REFERENCES public.recruitment_forms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    form_data JSONB NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    notes TEXT,
    processed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ÍNDICES PARA leave_submissions
CREATE INDEX idx_leave_submissions_form_id ON public.leave_submissions(form_id);
CREATE INDEX idx_leave_submissions_user_id ON public.leave_submissions(user_id);
CREATE INDEX idx_leave_submissions_status ON public.leave_submissions(status);
CREATE INDEX idx_leave_submissions_dates ON public.leave_submissions(start_date, end_date);

-- 4. HABILITAR RLS EN leave_submissions
ALTER TABLE public.leave_submissions ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS RLS PARA leave_submissions

-- Los usuarios pueden ver sus propias solicitudes
CREATE POLICY "Users can view their own leave submissions" ON public.leave_submissions
    FOR SELECT USING (user_id = auth.uid());

-- Los usuarios pueden crear sus propias solicitudes
CREATE POLICY "Users can create leave submissions" ON public.leave_submissions
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Los administradores pueden ver todas las solicitudes
CREATE POLICY "Admins can view all leave submissions" ON public.leave_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name = 'admin'
        )
    );

-- Los administradores pueden actualizar solicitudes (aprobar/rechazar)
CREATE POLICY "Admins can update leave submissions" ON public.leave_submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name = 'admin'
        )
    );

-- 6. TRIGGERS para updated_at
CREATE TRIGGER update_leave_submissions_updated_at BEFORE UPDATE ON public.leave_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. AGREGAR PERMISOS PARA FORMULARIOS
INSERT INTO public.permissions (name, description, category) VALUES
('forms.create', 'Crear formularios', 'Formularios'),
('forms.edit', 'Editar formularios', 'Formularios'),
('forms.delete', 'Eliminar formularios', 'Formularios'),
('forms.view_submissions', 'Ver envíos de formularios', 'Formularios'),
('forms.process_leave', 'Procesar solicitudes de ausencia', 'Formularios');

-- 8. ASIGNAR PERMISOS A ADMINISTRADORES
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'admin' AND p.name LIKE 'forms.%';

-- 9. FUNCIÓN PARA PROCESAR SOLICITUD DE AUSENCIA
CREATE OR REPLACE FUNCTION process_leave_submission(
    submission_id UUID,
    new_status VARCHAR(50),
    admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_submission public.leave_submissions%ROWTYPE;
    v_user_id UUID;
BEGIN
    -- Verificar que el usuario es admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles p
        JOIN public.roles r ON p.role_id = r.id
        WHERE p.id = auth.uid() AND r.name = 'admin'
    ) THEN
        RAISE EXCEPTION 'No tienes permisos para procesar solicitudes';
    END IF;

    -- Obtener la solicitud
    SELECT * INTO v_submission
    FROM public.leave_submissions
    WHERE id = submission_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Solicitud no encontrada';
    END IF;

    -- Actualizar la solicitud
    UPDATE public.leave_submissions
    SET 
        status = new_status,
        notes = COALESCE(admin_notes, notes),
        processed_by = auth.uid(),
        processed_at = NOW(),
        updated_at = NOW()
    WHERE id = submission_id;

    -- Si se aprueba, actualizar el estado del usuario (opcional)
    IF new_status = 'approved' THEN
        -- Aquí podrías actualizar el estado del usuario o crear un registro en una tabla de ausencias
        -- Por ahora solo registramos la aprobación
        NULL;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Solicitud procesada correctamente',
        'submission_id', submission_id,
        'status', new_status
    );
END;
$$;

-- 10. VISTA PARA ENVÍOS UNIFICADOS (recruitment + leave)
CREATE OR REPLACE VIEW public.unified_submissions AS
SELECT 
    a.id,
    'recruitment' as submission_type,
    a.form_id,
    rf.title as form_title,
    a.applicant_id as user_id,
    p.full_name as user_name,
    p.email as user_email,
    a.form_data,
    a.status,
    a.created_at,
    a.processed_at,
    NULL::DATE as start_date,
    NULL::DATE as end_date
FROM public.applications a
JOIN public.recruitment_forms rf ON a.form_id = rf.id
JOIN public.profiles p ON a.applicant_id = p.id

UNION ALL

SELECT 
    ls.id,
    'leave_request' as submission_type,
    ls.form_id,
    rf.title as form_title,
    ls.user_id,
    p.full_name as user_name,
    p.email as user_email,
    ls.form_data,
    ls.status,
    ls.created_at,
    ls.processed_at,
    ls.start_date,
    ls.end_date
FROM public.leave_submissions ls
JOIN public.recruitment_forms rf ON ls.form_id = rf.id
JOIN public.profiles p ON ls.user_id = p.id;

-- 11. DATOS DE EJEMPLO: Formulario de solicitud de ausencia
INSERT INTO public.recruitment_forms (title, description, fields, is_active, form_type) VALUES
(
    'Solicitud de Ausencia',
    'Formulario para solicitar ausencias programadas',
    '[
        {
            "id": "reason",
            "label": "Motivo de la ausencia",
            "type": "select",
            "required": true,
            "options": ["Vacaciones", "Enfermedad", "Personal", "Familiar", "Otro"]
        },
        {
            "id": "start_date",
            "label": "Fecha de inicio",
            "type": "date",
            "required": true
        },
        {
            "id": "end_date",
            "label": "Fecha de fin",
            "type": "date",
            "required": true
        },
        {
            "id": "description",
            "label": "Descripción / Detalles",
            "type": "textarea",
            "required": true,
            "placeholder": "Por favor, proporciona detalles adicionales sobre tu ausencia..."
        },
        {
            "id": "emergency_contact",
            "label": "Contacto de emergencia",
            "type": "text",
            "required": false,
            "placeholder": "Nombre y teléfono"
        }
    ]'::JSONB,
    true,
    'leave_request'
);

