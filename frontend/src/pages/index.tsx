import Head from 'next/head';
import Navbar from '../components/navBar';

export default function Home() {
  return (
    <>
      <Head>
        <title>Sistema de Préstamo</title>
      </Head>
      <Navbar />
      <main className="p-4">
        <h1 className="text-2xl font-bold">Bienvenido al laboratorio</h1>
      </main>
    </>
  );
}
