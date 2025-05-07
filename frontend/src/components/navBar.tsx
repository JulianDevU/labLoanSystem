import Link from 'next/link';

const navBar = () => {
  return (
    <nav className="bg-blue-700 text-white px-6 py-3 flex justify-between items-center shadow-md">
      <div className="text-xl font-bold">
        <Link href="/">LabFísica</Link>
      </div>
      <div className="space-x-4">
        <Link href="/dashboard" className="hover:underline">
          Dashboard
        </Link>
        <Link href="/equipment" className="hover:underline">
          Equipos
        </Link>
        <Link href="/login" className="hover:underline">
          Iniciar sesión
        </Link>
      </div>
    </nav>
  );
};

export default navBar;
