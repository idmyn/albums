# albums

Log in with spotify and see your albums sorted by the average colour of their artwork

NOTE: my spotify api credentials haven't gone through the approval process, so authenticating with spotify will redirect you to my library

## stack

### Styles: [daisyUI](https://daisyui.com)/[Tailwind](https://tailwindcss.com)

I tried [Radix Themes](https://www.radix-ui.com/) initially for this project but found myself writing inline styles quite often, at which point I wanted to reach for a css utility framework like Tailwind or [UnoCSS](https://unocss.dev) but I didn't love having the two styling systems in parallel...

So I'm using Tailwind with daisyUI here! The main advantage of this solution in my eyes for a project like this is that I enjoy playing with different JS libraries/frameworks and you can use Tailwind/daisyUI anywhere (unlike Radix which is React-specific).

### Metaframework: [Remix](https://remix.run/)

As mentioned above, I enjoy checking out different JS frameworks. I think I'm pretty happy with Remix at the moment though, since it ticks all of these boxes:

- [x] File-based routing without requiring a folder for each route (I love Svelte, but [the file-based routing in SvelteKit](https://kit.svelte.dev/docs/routing) feels quite heavy for tiny apps like these)
- [x] A way to write your component code and the server code to expose the data for that component in the same file ([useLoaderData](https://remix.run/docs/en/main/guides/data-loading#basics))
- [x] A built-in way to invalidate your component's server-fetched data to re-fetch it ([useRevalidator](https://remix.run/docs/en/main/hooks/use-revalidator))

The first point is just an aesthetic one, but I care about the bottom two points because in a simple small project like this it's nice not to _need_ a library like [Tanstack Query](https://tanstack.com/query/latest) (though I use it at work and love it)

I've got my eye on [Solid Start](https://start.solidjs.com/getting-started/what-is-solidstart) too, but it's a little too rough around the edges for me at the moment.

### ORM: [Drizzle](https://orm.drizzle.team/)

I really like Drizzle. In particular, defining your schema declaritively and 'pushing' it to your database without faffing with migrations is really nice while prototyping

### Also: [Effect](https://effect.website/)

Effect is a super interesting project which offers type-safe error handling but also a _WHOLE BUNCH_ of other things. I'm planning to write a blog post about it soon.
