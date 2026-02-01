const Alert = ({ type = 'info', message, onClose }) => {
    const colors = {
        success: 'bg-green-50 border-green-500 text-green-800',
        error: 'bg-red-50 border-red-500 text-red-800',
        warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
        info: 'bg-blue-50 border-blue-500 text-blue-800'
    };

    return (
        <div className={`${colors[type]} border-l-4 p-4 mb-4 rounded-lg shadow-sm`}>
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{message}</p>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="ml-4 text-lg font-bold hover:opacity-70"
                    >
                        ×
                    </button>
                )}
            </div>
        </div>
    );
};

export default Alert;
