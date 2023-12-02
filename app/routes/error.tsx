import { Link, MetaFunction } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [{ title: "albums" }];
};

export default function Error() {
  return (
    <div
      style={{ placeItems: "center", minHeight: "100vh", textAlign: "center" }}
    >
      <div className="center-screen">
        <div>
          <h1 className="text-5xl font-bold mb-2">oh no!</h1>
          <Link to="/" className="underline">
            back home
          </Link>
        </div>
      </div>
    </div>
  );
}
