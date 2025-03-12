const MeIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={`w-6 h-6 ${className} text-gray-500`}
  >
    <path
      fillRule="evenodd"
      d="M5 3a2 2 0 114 0 2 2 0 01-4 0zM2 8a6 6 0 0112 0v3a1 1 0 01-1 1H3a1 1 0 01-1-1V8z"
      clipRule="evenodd"
    />
  </svg>
);

export default MeIcon;
