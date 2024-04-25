I -> Interface
E -> Enum
B -> Base

Don't use default export, difficult to refactor.

Try not to reassign variables, makes code harder to reason about.

When a module export a large amount of interfaces with generic names that might conflict.
Export it in a namespace "I"

#### React

Different pages goes under app/
Every page has an accompanying {page_name}\_service.ts module.
The service module provides the page with everything it needs to function.

Ex:
fetching data from stores:

- sqlite
- blob
- usearch
