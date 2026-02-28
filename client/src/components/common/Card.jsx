export default function Card({ children, className = '', title, action }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
          {action}
        </div>
      )}
      <div className={title ? 'px-5 pb-4' : 'p-5'}>{children}</div>
    </div>
  );
}
