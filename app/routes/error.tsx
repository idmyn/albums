import { Grid, Heading, Box } from "@radix-ui/themes";
import { Link } from "~/components/Link";

export default function Error() {
  return (
    <Grid
      style={{ placeItems: "center", minHeight: "100vh", textAlign: "center" }}
    >
      <Box>
        <Heading as="h1" size="9" mb="3">
          oh no!
        </Heading>
        <Link
          to="/"
          underline="always"
          style={{ color: "black", textDecorationColor: "black" }}
        >
          back home
        </Link>
      </Box>
    </Grid>
  );
}
