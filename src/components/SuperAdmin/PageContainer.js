export default function PageContainer({ children, className = "" }) {
  return (
    <div className={`mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 overflow-visible ${className}`}>
      {children}
    </div>
  );
}
