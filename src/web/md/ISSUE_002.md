---
title: teachyourselfmath issue 2
---

### EXPLAINER

This week we dive into **prime numbers and their distribution**.  

Primes are the building blocks of integers: every number greater than 1 is either prime itself or can be written uniquely as a product of primes. This fact, known as the **Fundamental Theorem of Arithmetic**, underpins much of number theory.  

Key ideas to explore:  

- **Prime factorization**: every integer has a unique prime breakdown (order aside).  
- **Divisibility properties**: if a prime divides a product, it divides at least one factor.  
- **Canonical form**: integers can be expressed with primes raised to exponents (e.g., $360 = 2^3 \cdot 3^2 \cdot 5$).  
- **Irrationality proofs**: primes play a role in showing numbers like $\sqrt{2}$ are not rational.  
- **Sieve of Eratosthenes**: an ancient yet efficient way to list primes up to $n$.  
- **Infinitude of primes**: Euclid’s elegant argument shows primes never run out.  
- **Distribution mysteries**: gaps between primes, twin primes, Goldbach’s conjecture (every even integer $>2$ is the sum of two primes).

---

### EASY STUFF

1) Factorize $1260$ into primes.  
2) Write $504$ in canonical form $p_1^{k_1} p_2^{k_2} \cdots$.  
3) Show that $35$ divides $\binom{35}{2}$.  
4) Verify that $\sqrt{3}$ is irrational by mimicking the classic $\sqrt{2}$ argument.  

---

### MEDIUM STUFF

1) Find all primes of the form $n^2 - 4$ for integers $n$.  
2) Show that if $p \geq 5$ is prime, then $p^2 + 2$ is composite.  
3) Prove that every integer $n > 11$ can be written as the sum of two composites.  
4) List all primes that divide $50!$.  
5) Find the prime factorization of $1234$.  
6) Show that any integer $n$ can be expressed uniquely as $n = 2^k m$, with $m$ odd.  
7) Use the Sieve of Eratosthenes to list primes between 100 and 150.  
8) Show that any composite three-digit integer must have a prime factor $\leq 31$.  
9) Verify that $1949$ and $1951$ form a twin prime pair.  
10) Find all prime triplets of the form $p, p+2, p+6$ with $p < 50$.  


---

### HARD STUFF

**Problem:** Prove that there are infinitely many primes of the form $4n+3$.  

*Sketch solution:*  
- Assume only finitely many such primes $q_1, q_2, \dots, q_s$.  
- Consider $N = 4q_1q_2\cdots q_s - 1$.  
- $N$ is of the form $4n+3$, so at least one prime factor of $N$ must also be $4n+3$.  
- But this new prime is not among $q_1, \dots, q_s$ (since it divides $N$ but not $4q_1\cdots q_s$).  
- Contradiction. Therefore infinitely many primes of the form $4n+3$ exist.

---

"The primes are the jewels studding the vast expanse of numbers." 
— *Richard Dedekind*