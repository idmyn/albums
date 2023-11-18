import type { MetaFunction } from "@remix-run/node";
import { Link } from "../components/Link";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div>
      <Link to="/login">login</Link>
    </div>
  );
}
