# A bug we found in class (9/29)

`productService.add()` inserted the caller's partial product into the database
and only *then* applied the defaults from `productFromFields()` — so the
defaults decorated the return value and never reached the stored document.
Fixing that revealed a second problem: the fixed-up object carries a
placeholder `id`, which must not be stored beside Mongo's `_id`.

Both halves are fixed in `src/services/product-service.ts`, marked with
comments. The full write-up, including why nothing before the test noticed, is
in the week 4 notes:

<https://si679-public.github.io/weeks/week04-rest/post-class-memo>
