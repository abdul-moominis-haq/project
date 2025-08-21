import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-xl mb-8">Sorry, we couldnt find what you were looking for.</p>
      <Link href="/">
        <Button>Return Home</Button>
      </Link>
    </div>
  );
}
