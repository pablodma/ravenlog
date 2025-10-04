'use client'

export default function TypographyDemo() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Typography Demo - Inter Font System</h1>
        <p>This demonstrates the automatic typography system applied throughout the application.</p>
      </div>

      <div className="grid gap-6">
        {/* Headings */}
        <div className="card p-6">
          <h2>Headings</h2>
          <div className="space-y-4">
            <h1>Display Title (h1)</h1>
            <h2>Section Title (h2)</h2>
            <h3>Subsection Title (h3)</h3>
            <h4>Card Title (h4)</h4>
            <h5>Form Label (h5)</h5>
            <h6>Small Label (h6)</h6>
          </div>
        </div>

        {/* Body Text */}
        <div className="card p-6">
          <h2>Body Text</h2>
          <div className="space-y-4">
            <p>This is regular body text with proper line height and spacing. It should be easy to read and follow the design specifications from the image.</p>
            <p className="text-muted-foreground">This is muted text for secondary information.</p>
          </div>
        </div>

        {/* Form Elements */}
        <div className="card p-6">
          <h2>Form Elements</h2>
          <div className="space-y-4">
            <div>
              <label>Form Label</label>
              <input 
                type="text" 
                placeholder="Input placeholder text"
                className="input w-full mt-1"
              />
              <p className="text-muted-foreground mt-1">Helper text for form fields</p>
            </div>
            <div>
              <label>Textarea</label>
              <textarea 
                placeholder="Textarea placeholder"
                className="input w-full mt-1"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="card p-6">
          <h2>Buttons</h2>
          <div className="flex gap-3">
            <button className="btn-primary">Primary Button</button>
            <button className="btn-secondary">Secondary Button</button>
            <button className="btn-ghost">Ghost Button</button>
          </div>
        </div>

        {/* Navigation */}
        <div className="card p-6">
          <h2>Navigation</h2>
          <nav className="space-y-2">
            <a href="#" className="nav-item nav-item-active">Active Nav Item</a>
            <a href="#" className="nav-item nav-item-inactive">Inactive Nav Item</a>
            <a href="#" className="nav-item nav-item-inactive">Another Nav Item</a>
          </nav>
        </div>

        {/* Badges */}
        <div className="card p-6">
          <h2>Badges</h2>
          <div className="flex gap-2">
            <span className="badge badge-primary">Primary Badge</span>
            <span className="badge badge-success">Success Badge</span>
            <span className="badge badge-warning">Warning Badge</span>
            <span className="badge badge-danger">Danger Badge</span>
          </div>
        </div>

        {/* Table */}
        <div className="card p-6">
          <h2>Table</h2>
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header p-2 text-left">Header 1</th>
                <th className="table-header p-2 text-left">Header 2</th>
                <th className="table-header p-2 text-left">Header 3</th>
              </tr>
            </thead>
            <tbody>
              <tr className="table-row">
                <td className="p-2">Cell 1</td>
                <td className="p-2">Cell 2</td>
                <td className="p-2">Cell 3</td>
              </tr>
              <tr className="table-row">
                <td className="p-2">Cell 4</td>
                <td className="p-2">Cell 5</td>
                <td className="p-2">Cell 6</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Rich Text Editor */}
        <div className="card p-6">
          <h2>Rich Text Editor</h2>
          <div className="border border-input rounded-lg">
            <div className="rich-text-toolbar flex items-center gap-1 p-2 border-b border-input bg-muted/50">
              <button className="p-1 hover:bg-muted rounded"><strong>B</strong></button>
              <button className="p-1 hover:bg-muted rounded"><em>I</em></button>
              <button className="p-1 hover:bg-muted rounded"><u>U</u></button>
              <button className="p-1 hover:bg-muted rounded"><s>S</s></button>
              <div className="w-px h-4 bg-border mx-1"></div>
              <button className="p-1 hover:bg-muted rounded">H2</button>
              <button className="p-1 hover:bg-muted rounded">H3</button>
            </div>
            <textarea 
              placeholder="Rich text editor content..."
              className="w-full p-3 bg-background text-foreground border-0 focus:ring-0 resize-none"
              rows={4}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

