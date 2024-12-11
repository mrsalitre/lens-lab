import { LensLogin } from "./components/LensLogin";

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to Lens Lab</h1>
      <p className="mb-8">This is a simple Lens Protocol client for the Lens Protocol.</p>
      <LensLogin />
    </main>
  );
}
