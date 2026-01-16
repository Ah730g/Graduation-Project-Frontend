import { useLanguage } from '../contexts/LanguageContext';

function AdminTable({ columns, data, actions, loading, onRowClick, highlightedRowId }) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-[#888] dark:text-gray-400">{t('common.loading')}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[#888] dark:text-gray-400">{t('admin.noData')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left font-semibold text-[#444] dark:text-white">
                {col.label}
              </th>
            ))}
            {actions && (
              <th className="px-4 py-3 text-left font-semibold text-[#444] dark:text-white">
                {t('admin.actions')}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => {
            const isHighlighted = highlightedRowId && row.id === parseInt(highlightedRowId);
            return (
              <tr 
                key={row.id || index} 
                id={isHighlighted ? `row-${row.id}` : undefined}
                className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 ${onRowClick ? 'cursor-pointer' : ''} ${
                  isHighlighted ? 'bg-yellow-200 dark:bg-yellow-600 animate-pulse' : ''
                }`}
                onClick={() => onRowClick && onRowClick(row)}
              >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm text-[#444] dark:text-gray-200">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {actions && (
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {actions(row).map((action, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick();
                        }}
                        className={`px-3 py-1 rounded-md text-sm font-semibold transition duration-300 ease hover:scale-105 ${
                          action.variant === 'danger'
                            ? 'bg-red-500 dark:bg-red-600 text-white'
                            : action.variant === 'success'
                            ? 'bg-green-500 dark:bg-green-600 text-white'
                            : 'bg-yellow-300 dark:bg-yellow-400 text-[#444] dark:text-gray-900'
                        }`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default AdminTable;

