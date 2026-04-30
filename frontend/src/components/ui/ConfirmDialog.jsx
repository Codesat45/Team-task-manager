import Modal from './Modal'
import Spinner from './Spinner'

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, loading = false, variant = 'danger' }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-slate-600 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="btn-secondary" disabled={loading}>
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}
        >
          {loading ? <Spinner size="sm" /> : 'Confirm'}
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
