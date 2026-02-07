// import { Outlet } from 'react-router';
// import { Header } from './next-header';

// export default function NextLayout() {
//   return (
//     <main className="h-full flex flex-col">
//       <Header />
//       <Outlet />
//     </main>
//   );
// }


import { Outlet } from 'react-router';
import { Header } from './next-header';

export default function NextLayout() {
  return (
    <section className="h-full flex flex-row overflow-hidden">
      <Header></Header>
      <main className="flex-1 h-full overflow-auto">
        <Outlet />
      </main>
    </section>
  );
}