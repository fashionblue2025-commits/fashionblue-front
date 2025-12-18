import { useState, useEffect } from 'react'
import { X, Edit2, Check, Download } from 'lucide-react'

export default function AccountStatementPreview({ orderId, draft, onClose, onConfirm, loading }) {
  const [isEditing, setIsEditing] = useState({
    clientName: false,
    city: false,
    date: false,
    concept: false
  })

  const [editableData, setEditableData] = useState({
    clientName: draft?.clientName || '',
    city: draft?.city || '',
    date: draft?.date ? new Date(draft.date).toISOString().split('T')[0] : '',
    concept: draft?.concept || ''
  })

  useEffect(() => {
    if (draft) {
      setEditableData({
        clientName: draft.clientName,
        city: draft.city,
        date: draft.date ? new Date(draft.date).toISOString().split('T')[0] : '',
        concept: draft.concept
      })
    }
  }, [draft])

  const handleEdit = (field) => {
    setIsEditing({ ...isEditing, [field]: true })
  }

  const handleSave = (field) => {
    setIsEditing({ ...isEditing, [field]: false })
  }

  const handleChange = (field, value) => {
    setEditableData({ ...editableData, [field]: value })
  }

  const handleConfirm = () => {
    const dataToSend = {
      clientName: editableData.clientName,
      city: editableData.city,
      date: new Date(editableData.date).toISOString(),
      concept: editableData.concept
    }
    onConfirm(dataToSend)
  }

  const formatDateSpanish = (dateString) => {
    const date = new Date(dateString)
    const months = [
      'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ]
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    return `${editableData.city.toUpperCase()}, ${day} DE ${month} DE ${year}`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-900">
              Previsualización - Cuenta de Cobro
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Leyenda de campos editables */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <Edit2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-blue-900">Campos editables resaltados en amarillo</p>
              <p className="text-blue-700">Haz clic en el ícono de lápiz para editar: Cliente, Ciudad, Fecha y Concepto</p>
            </div>
          </div>
        </div>

        {/* Document Preview */}
        <div className="p-8">
          <div className="bg-white border-2 border-gray-300 p-12 space-y-6 font-mono text-sm">
            {/* Título */}
            <div className="text-center">
              <h1 className="text-lg font-bold">
                CUENTA DE COBRO N° {draft?.statementNumber}
              </h1>
            </div>

            {/* Vendedor y Cliente */}
            <div className="space-y-2">
              <p className="font-bold">{draft?.sellerName?.toUpperCase()}</p>
              
              {/* Cliente Editable */}
              <div className="flex items-center gap-2">
                <span className="font-bold">CLIENTE:</span>
                {isEditing.clientName ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editableData.clientName}
                      onChange={(e) => handleChange('clientName', e.target.value)}
                      className="flex-1 px-2 py-1 border-2 border-blue-500 rounded focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSave('clientName')}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1 bg-yellow-100 px-2 py-1 rounded border-2 border-yellow-300">
                    <span className="flex-1">{editableData.clientName?.toUpperCase()}</span>
                    <button
                      onClick={() => handleEdit('clientName')}
                      className="text-blue-600 hover:text-blue-700 flex-shrink-0"
                      title="Editar cliente"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Ciudad y Fecha Editable */}
              <div className="flex items-center gap-2">
                <span className="font-bold">CIUDAD Y FECHA:</span>
                {isEditing.city || isEditing.date ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editableData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      className="w-40 px-2 py-1 border-2 border-blue-500 rounded focus:outline-none"
                      placeholder="Ciudad"
                    />
                    <input
                      type="date"
                      value={editableData.date}
                      onChange={(e) => handleChange('date', e.target.value)}
                      className="px-2 py-1 border-2 border-blue-500 rounded focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        handleSave('city')
                        handleSave('date')
                      }}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1 bg-yellow-100 px-2 py-1 rounded border-2 border-yellow-300">
                    <span className="flex-1">{formatDateSpanish(editableData.date)}</span>
                    <button
                      onClick={() => {
                        handleEdit('city')
                        handleEdit('date')
                      }}
                      className="text-blue-600 hover:text-blue-700 flex-shrink-0"
                      title="Editar ciudad y fecha"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Declaración Legal */}
            <div className="space-y-2 text-justify">
              <p className="font-bold">
                PARA EFECTOS LEGALES RELACIONADOS CON LAS NORMAS FISCALES ME PERMITO INFORMAR:
              </p>
              <p className="text-xs">
                Atendiendo la ley 1819 de 2016 Art 383 del Estatuto Tributario en su parágrafo 2, me
                permito informar bajo gravedad de juramento que en asocio a la actividad contratada con su
                empresa:
              </p>
              <ol className="list-decimal list-inside text-xs space-y-1 pl-4">
                <li>Soy residente en Colombia: <strong>SÍ</strong></li>
                <li>Pertenezco al régimen no responsable de IVA</li>
                <li>Número de trabajadores a mi cargo o contratistas que tengo vinculados a mi actividad es: (0)</li>
                <li>Que me encuentro dentro de las situaciones contempladas en el Art del Decreto 1165 de 1996 (Obligados a Facturar)</li>
              </ol>
              <p className="text-xs">
                En consecuencia y de conformidad con la normatividad fiscal, no estoy obligado a expedir
                factura ni documento equivalente.
              </p>
              <p className="text-xs">
                Por lo anterior, para tener en cuenta en el proceso de retención en la fuente para empleados
                según lo establecido en la ley 1819 de 2016.
              </p>
            </div>

            {/* Concepto Editable */}
            <div className="space-y-2">
              <p className="font-bold">POR CONCEPTO DE:</p>
              {isEditing.concept ? (
                <div className="space-y-2">
                  <textarea
                    value={editableData.concept}
                    onChange={(e) => handleChange('concept', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border-2 border-blue-500 rounded focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSave('concept')}
                    className="text-green-600 hover:text-green-700 flex items-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    <span>Guardar</span>
                  </button>
                </div>
              ) : (
                <div className="relative bg-yellow-100 p-3 rounded border-2 border-yellow-300">
                  <p className="text-sm pr-8">{editableData.concept}</p>
                  <button
                    onClick={() => handleEdit('concept')}
                    className="absolute top-3 right-3 text-blue-600 hover:text-blue-700"
                    title="Editar concepto"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Valor Total */}
            <div className="space-y-2">
              <p className="font-bold text-lg">
                VALOR TOTAL ${draft?.totalAmount?.toLocaleString('es-CO')}
              </p>
            </div>

            {/* Información Bancaria */}
            <div className="space-y-1">
              <p>
                Favor consignar a mi cuenta de nequi <strong>{draft?.bankAccount}</strong>
              </p>
              <p>Atentamente,</p>
            </div>

            {/* Firma */}
            <div className="pt-12 space-y-1">
              <p className="font-bold">{draft?.sellerName?.toUpperCase()}</p>
              <p>{draft?.sellerId}</p>
            </div>
          </div>
        </div>

        {/* Footer con botones */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Revisa y edita los campos necesarios antes de generar el PDF
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="btn bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              {loading ? 'Generando...' : 'Generar PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
