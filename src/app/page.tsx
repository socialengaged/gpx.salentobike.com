import { HomePageBody } from './HomePageBody';

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
      <div className="max-w-md w-full text-center space-y-8">
        <HomePageBody />
      </div>
    </div>
  );
}
