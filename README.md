This really needs examples and proably a blog post to explain (but you can take a look at the tests and inspect types in your editor).  But:

This is an experiment to see how it turns out to use TypeScript type inference and "correlated unions" to propagate types from fixture factory functions to the type of a "fixture memo" factory class that uses the test fixture construction pattern used in https://github.com/jjlee/fixt (which is essentially the same pattern as used in py.test, with some caveats).

The idea is: Is it feasible to avoid writing out fixture types twice?  (Once in the functions that make the fixtures, and then again in the interface of the factory class.)

Though I think it was a worthwhile experiment to see how far I could push this, I don't recommend actually using anything like this in real code.  For one thing, it's a bit crazy.  Also, the factory class ends up with a type that involves complicated intersection types (one intersection per fixture factory function).  I don't think there's currently a way to avoid that.  I also wonder what the performance implications are for tsc runs.  In a real application, it would be better to explicitly declare an interface that describes your fixture types (that also works in Python with mypy).
