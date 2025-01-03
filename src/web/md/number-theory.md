# number theory

### well ordering principle
It states that every non-empty subset of nonnegative integers contains a least element.

### archimedean property
If a and b are any positive integers, then there exists a positive integer n such that na >= b.

### first principle of finite induction
Let S be a set of positive integers with the following properties:

1. The integer 1 belongs to S.
2. Whenever the integer k is in S, k + 1 must also be in S.

Then S is the set of all positive integers.

### second principle of finite induction
Let S be a set of positive integers with the following properties:

1. The integer 1 belongs to S.
2. If k is a positive integer such that 1, 2, ..., k belong to S, then k + 1 must also be in S.

Then S is the set of all positive integers.

### triangular numbers
A number is triangular if and only if it is of the form n * (n + 1) / 2 for some n >= 1.

### the division algorithm
Given integers a and b, with b > 0, there exist unique integers q and r satisfying a = bq + r, 0 <= r < b

### greatest common divisor
An integer b is said to be divisible by an integer, a != 0, in symbols, a | b, if there exists some integer c such that b = ac.

The gcd of a and b, gcd(a, b) is the positive integer d satisying the following:
(i) d | a and d | b
(ii) if c | a and c | b, then c <= d

There also exist two integers x and y such that, gcd(a, b) = ax + by. More generally, gcd(a, b, c) = ax + by + cz.

If gcd(a, b) = d, then gcd(a / d, b / d) = 1

If a | c and b | c with gcd(a, b) = 1, then ab | c.

If gcd(a, b) = 1, a and b are relatively prime or coprime.

euclid's lemma: If a | bc, with gcd(a, b) = 1, then a | c.

euclidean algorithm: If a = qb + r, then gcd(a, b) = gcd(b, r)

gcd(a, b) * lcm(a, b) = a * b

### the diophantine equation
It is an equation, typically a polynomial equation in two or more unknowns with integer coefficients, for which only integer solutions are of interest.

Most common form seen out there: ax + by = c. A solution for this exists if and only if d | c where d = gcd(a, b).

### prime numbers: the fundamental theorem of arithmetic
Every integer greater than 1 can be uniquely expressed as a product of prime numbers, up to the order of the factors.

### prime numbers: the seive of eratosthenes
The sieve of Eratosthenes is an algorithm for finding all prime numbers up to any given limit.

Steps:
1. Initialize: Create a list of numbers from 2 to n.
2. Mark Multiples: Starting with 2, mark all multiples of the current number as composite (non-prime).
3. Repeat: Move to the next unmarked number (the next prime) and mark its multiples. Continue this process up to sqrt(n).
4. Collect Primes: The unmarked numbers remaining in the list are the primes up to n.

Any composite number must have at least one factor less than or equal to sqrt(n). By marking multiples of numbers up to sqrt(n), we ensure all composite numbers are identified.

### prime numbers: how many?
Euclid gave a detailed proof that there is an infinite number of primes.

### the binomial theorem
(a + b) ^ n = sum from k = 0 to k = n of (nck * x^k * y^(n-k))

### pascal's rule

n+1Ck = nCk + nC(k-1), 1 <= k <= n

### conjectures
A conjecture is an idea or statement that someone believes to be true but hasn't been proven with absolute certainty.

1. 3n + 1 conjecture

f(n) = (3n + 1) / 2 if n is odd, n / 2 if n is even.

2. the goldbach conjecture

Every even integer greater than 2 can be expressed as the sum of two prime numbers.

### sequences

1. lucas sequence

1, 3, 4, 7, 11, 18, 29...

### series

1 + 2 + 3 + ... + n = n(n + 1) / 2

1 + 3 + 5 + ... + (2n - 1) = n^2

1 * 2 + 2 * 3 + 3 * 4 ... n * (n + 1) = n(n + 1)(n + 2) / 3

1^3 + 2^3 + 3^3 + ... + n^3 = (n * (n + 1) / 2) ^ 2
