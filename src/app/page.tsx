import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { HomeContent } from './HomeContent';

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
      <div className="max-w-md w-full text-center space-y-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
          Salento Bike Routes
        </h1>
        <p className="text-slate-600 text-lg sm:text-xl">
          Discover, save, and follow bike routes in Salento. Works offline after
          you save a route.
        </p>
        <HomeContent />
      </div>
    </div>
  );
}
