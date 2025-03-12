const UserIcon = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={`w-6 h-6 ${className} text-gray-500`}
    >
        <path
            fillRule="evenodd"
            d="M10 2a5 5 0 11-5 5 5 5 0 015-5zM4 13a6 6 0 0112 0v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3z"
            clipRule="evenodd"
        />
    </svg>
);

export default UserIcon;
