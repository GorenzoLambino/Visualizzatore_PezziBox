import React, { useState, useEffect } from 'react'
import { Scene3D } from './Scene3D'
import { calculatePacking, PREDEFINED_BOXES, ARRIVI_BOXES } from './packingLogic'
import './index.css'

function BoxCard({ boxInfo, itemDims, isMixed }) {
  const result = calculatePacking(boxInfo.dimensions, itemDims, isMixed)
  return (
    <div className="box-card">
      <div className="box-header">
        <h3>{boxInfo.name}</h3>
        <span className="dims-label">{boxInfo.dimensions.join(' x ')}</span>
      </div>
      <div className="canvas-container small">
        <Scene3D boxDims={boxInfo.dimensions} items={result.items} />
      </div>
      <div className="stats-container small-stats">
        <div className="stat-box">
          <span>Q.tà Massima</span>
          <strong>{result.maxQuantity}</strong>
        </div>
        <div className="stat-box">
          <span>Orientamento Ottimale</span>
          <strong>{result.optimalOrientation.join(' x ')}</strong>
        </div>
        <div className="stat-box">
          <span>Efficienza Vol.</span>
          <strong>{result.efficiency}%</strong>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [itemDims, setItemDims] = useState([9.4, 5.2, 6.2])
  const [department, setDepartment] = useState('LOGIMAT')
  const [boxes, setBoxes] = useState(PREDEFINED_BOXES)
  const [isMixed, setIsMixed] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
  }, [isDarkMode])

  const handleDepartmentChange = (dept) => {
    setDepartment(dept)
    setBoxes(dept === 'LOGIMAT' ? PREDEFINED_BOXES : ARRIVI_BOXES)
  }

  const updateItem = (index, value) => {
    const newDims = [...itemDims]
    newDims[index] = parseFloat(value) || 0
    setItemDims(newDims)
  }

  const updateBoxDim = (boxIndex, dimIndex, value) => {
    const newBoxes = [...boxes]
    const newDims = [...newBoxes[boxIndex].dimensions]
    newDims[dimIndex] = parseFloat(value) || 0
    newBoxes[boxIndex] = { ...newBoxes[boxIndex], dimensions: newDims }
    setBoxes(newBoxes)
  }

  return (
    <div className="app-container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: '120px' }}></div> {/* Spacer per centrare l'h1 */}
        <h1>Visualizzatore Bin Packing 3D - Multi-Box</h1>
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          style={{
            background: 'none', border: '1px solid #fff', color: '#fff', 
            padding: '6px 12px', borderRadius: '4px', cursor: 'pointer',
            width: '120px', fontSize: '0.9rem'
          }}
        >
          {isDarkMode ? '☀️ Chiaro' : '🌙 Scuro'}
        </button>
      </header>
      
      <main>
        <div className="department-selector" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
          <button 
            className={`dept-btn ${department === 'LOGIMAT' ? 'active' : ''}`}
            onClick={() => handleDepartmentChange('LOGIMAT')}
          >
            📦 Magazzino LOGIMAT
          </button>
          <button 
            className={`dept-btn ${department === 'ARRIVI' ? 'active' : ''}`}
            onClick={() => handleDepartmentChange('ARRIVI')}
          >
            🚚 Reparto Arrivi
          </button>
        </div>

        <div className="item-controls top-controls">
          <h3>Dimensioni Confezione (Oggetto)</h3>
          
          <div className="algorithm-toggle" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center' }}>
            <strong>Algoritmo:</strong>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="radio" name="algorithm" checked={!isMixed} onChange={() => setIsMixed(false)} />
              Blocco Uniforme
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="radio" name="algorithm" checked={isMixed} onChange={() => setIsMixed(true)} />
              Misto (Taglio Ghigliottina)
            </label>
          </div>

          <div className="slider-row">
            <div className="slider-group">
              <label><span className="color-x">■</span> Lunghezza (X)</label>
              <input type="range" min="0.1" max="50" step="0.1" value={itemDims[0]} onChange={(e) => updateItem(0, e.target.value)} />
              <input type="number" step="0.1" value={itemDims[0]} onChange={(e) => updateItem(0, e.target.value)} className="number-input" />
            </div>
            <div className="slider-group">
              <label><span className="color-y">■</span> Altezza (Y)</label>
              <input type="range" min="0.1" max="50" step="0.1" value={itemDims[1]} onChange={(e) => updateItem(1, e.target.value)} />
              <input type="number" step="0.1" value={itemDims[1]} onChange={(e) => updateItem(1, e.target.value)} className="number-input" />
            </div>
            <div className="slider-group">
              <label><span className="color-z">■</span> Profondità (Z)</label>
              <input type="range" min="0.1" max="50" step="0.1" value={itemDims[2]} onChange={(e) => updateItem(2, e.target.value)} />
              <input type="number" step="0.1" value={itemDims[2]} onChange={(e) => updateItem(2, e.target.value)} className="number-input" />
            </div>
          </div>
        </div>

        <details className="boxes-settings">
          <summary>⚙️ Impostazioni Configurazioni BOX</summary>
          <div className="boxes-settings-content">
            {boxes.map((box, bIdx) => (
              <div key={bIdx} className="box-setting-row">
                <span className="box-name">{box.name}</span>
                <div className="input-group">
                  <label><span className="color-x">■</span> L:</label>
                  <input type="number" step="1" value={box.dimensions[0]} onChange={(e) => updateBoxDim(bIdx, 0, e.target.value)} className="number-input" />
                </div>
                <div className="input-group">
                  <label><span className="color-y">■</span> A:</label>
                  <input type="number" step="1" value={box.dimensions[1]} onChange={(e) => updateBoxDim(bIdx, 1, e.target.value)} className="number-input" />
                </div>
                <div className="input-group">
                  <label><span className="color-z">■</span> P:</label>
                  <input type="number" step="1" value={box.dimensions[2]} onChange={(e) => updateBoxDim(bIdx, 2, e.target.value)} className="number-input" />
                </div>
              </div>
            ))}
          </div>
        </details>

        <div className="boxes-grid">
          {boxes.map(box => (
            <BoxCard key={box.name} boxInfo={box} itemDims={itemDims} isMixed={isMixed} />
          ))}
        </div>
      </main>
    </div>
  )
}

export default App
