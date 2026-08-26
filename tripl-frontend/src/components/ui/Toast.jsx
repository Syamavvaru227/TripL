import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"

let addToastFn = null
export const showToast = (msg, type = "success") => addToastFn?.(msg, type)

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])
  addToastFn = (msg, type) => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }
  const icons = { success: <CheckCircle size={16} />, error: <AlertCircle size={16} />, info: <Info size={16} /> }
  const colors = { success: "bg-emerald text-white", error: "bg-red-500 text-white", info: "bg-peacock text-white" }
  return (
    <div className="fixed bottom-20 right-4 z-[9999] flex flex-col gap-2 md:bottom-6">
      <AnimatePresence>
      {toasts.map(t => (
        <motion.div key={t.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40, scale: 0.9 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${colors[t.type] || colors.info}`}>
          {icons[t.type]} <span>{t.msg}</span>
          <button onClick={() => setToasts(ts => ts.filter(x => x.id !== t.id))} className="ml-2 opacity-70 hover:opacity-100"><X size={14} /></button>
        </motion.div>
      ))}
      </AnimatePresence>
    </div>
  )
}
