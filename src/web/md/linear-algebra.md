# linear algebra

### vector

For a physics student, a vector is a quantity that has both magnitude and direction.

For a mathematician, a vector is an element of a vector space.

For a computer scientist, a vector is an array of numbers.

The components of a vector are the numbers that make up the vector.

### operations

There are two fundamental operations on vectors: addition and scalar multiplication.

Combining these two operations gives you a linear combination of vectors. Example: 2v1 + 3v2. We may generalize this as a1v1 + a2v2 + ... + anvn.

Addition of vectors is done, component-wise.

### what do the combinations fill?

a1v1 fills a line.

a1v1 + a2v2 fills an entire two-dimensional plane if v2 is not on the same line as v1.

a1v1 + a2v2 + a3v3 fills a three-dimensional space if v3 is not in the plane defined by v1 and v2. If the numbers are real, this space is R^3.

line -> plane -> space is a typical situation but it may not be the case always.

### length of a vector

The length of a vector is the magnitude of the vector.

||a|| = sqrt(a1^2 + a2^2 + ... + an^2)

Some books show length as |a|.

Length of a unit vector is 1.

unit vector u = a / ||a||

### dot product

The dot product of two vectors is a scalar value that represents the angle between the vectors. 

a * b = |a| * |b| * cos(theta), where a and b are vectors and theta is the angle between them.

The dot product is commutative: a * b = b * a.

The dot product is distributive: a * (b + c) = a * b + a * c.

The dot product is linear: a * (b + c) = a * b + a * c.

Looking at cos(theta), we can see that the dot product of two perpendicular vectors is 0.

Dot product does not obey the cancellation law.

### schwarz inequality

||a * b|| <= ||a|| * ||b||

This is considered as a pretty important inequality.

### triangle inequality

||a + b|| <= ||a|| + ||b||

### matrix

A matrix is a rectangular array of numbers.

An m x n matrix has m rows and n columns.

When looking at a matrix based equation, if you want to convert it into a linear combination of vectors, you can do so by treating each column of the matrix as a vector.

### linear equations

We are fundamentally interested in solving Ax = b, where A is a matrix, x is a vector, and b is a vector.

Ax gives a linear combination where the vectors are the columns of A and the coefficients are the components of x.

Ax is also dot product of rows of A with the column of x. In this view, it helps to look at the vector x as a matrix with a single column.

x = A^(-1)b

In some cases, the matrix A may not be invertible.

### independence and dependence

Let {v1, v2, v3, ..., vn} be a set of vectors.

We say these vectors are linearly independent if the only way to write a linear combination equal to the zero vector is if all the coefficients are 0.

On the other hand, we say these vectors are linearly dependent if there exists a non-zero linear combination equal to the zero vector. In that case, at least one of them can be written as a linear combination of the others.

Linearly independent: No vector in the set is “redundant.” You cannot express any vector as a combination of the others.

Linearly dependent: At least one vector in the set is “redundant,” meaning it can be expressed as a linear combination of the others (nontrivially).

Linearly dependent vectors in the 2D plane form a line.

Linearly dependent vectors in the 3D space may form a plane or a line.

A matrix is not invertible if the columns are linearly dependent.

### elimination

We solve linear systems by systematically applying row operations to reduce the augmented matrix. 
This method is commonly called Gaussian elimination. 

The main idea:
1. Pick a non-zero entry (pivot).
2. Use the pivot to eliminate the entries below it by replacing each lower row with a combination that zeroes out the column.
3. Move to the next pivot and repeat until the matrix is in an echelon form.

Once in this upper-triangular form (or a more refined reduced echelon form), we can back-substitute to find the solution. Elimination not only simplifies the system but also reveals whether the system is inconsistent (no solutions) or if there are free variables (infinitely many solutions).

### matrix operations

You can add matrices of the same size by adding their corresponding entries. 

You can multiply a matrix by a scalar by multiplying each entry by that scalar.

You can multiply two matrices by following the rules of matrix multiplication which are:

1. The number of columns in the first matrix must equal the number of rows in the second matrix.
2. The resulting matrix will have the same number of rows as the first matrix and the same number of columns as the second matrix.
3. Each entry in the resulting matrix is the dot product of a row from the first matrix with a column from the second matrix.

Matrix multiplication is not commutative. But it is associative and distributive over addition.

### inverses

A matrix is invertible if there exists another matrix such that A * inverse(A) = I and inverse(A) * A = I.

Not all matrices are invertible, only those whose columns are linearly independent.  In practical computation, you can use elimination to find an inverse by setting up an augmented matrix [A | I] and performing row operations until A transforms into I.

If A has an inverse, then Ax = B has a solution because x = inverse(A) * B.

### factorization of A = LU

A = LU where L is a lower triangular matrix (entries above diagonal are 0) and U is an upper triangular matrix (entries below diagonal are 0).

LU factorization is essentially recording the steps of Gaussian elimination in matrix form:
- U is the final result after elimination
- L captures the multipliers used during elimination

Key points:
1. Not every matrix has an LU factorization
2. If it exists, LU factorization is unique
3. For matrices with an LU factorization, we can solve Ax = b in two steps:
   - First solve Ly = b (forward substitution)
   - Then solve Ux = y (back substitution)

This is computationally efficient because once we have L and U, we can solve for multiple b vectors without repeating elimination.

Example: For a 2×2 matrix
```
L = [1   0]    U = [u11  u12]
    [l21 1]        [0    u22]
```
where l21, u11, u12, u22 are computed during elimination.

### transposes

The transpose of a matrix A, written as A^T, is obtained by converting rows into columns (or columns into rows). For an m×n matrix A, its transpose A^T is an n×m matrix.

Key properties:
1. (A^T)^T = A
2. For a scalar c: (cA)^T = cA^T
3. (A + B)^T = A^T + B^T

For the product of matrices (AB)^T:
- The transpose of a product equals the product of transposes in reverse order
- (AB)^T = B^T * A^T

Example:
If A = [1 2]    Then A^T = [1 3]
       [3 4]              [2 4]

A symmetric matrix is equal to its transpose: A = A^T

### permutations

A permutation of a set of elements is a rearrangement of those elements. In matrix work, permutations often appear as permutation matrices—matrices that reorder rows (or columns).

A permutation matrix has exactly one entry of 1 in each row and each column, with all other entries 0.

Multiplying a matrix by a permutation matrix on the left reorders the matrix’s rows; multiplying on the right reorders its columns.

When doing elimination, sometimes the pivot (the entry we want to use to clear entries below it) is zero or too small (which can cause numerical issues). To fix that, we swap rows so that a non-zero or larger entry becomes the pivot. The permutation matrix P is the formal way of “recording” those row swaps. Multiplying on the left by P effectively reorders the rows of A, making the pivot factorization PA = LU possible.

### determinants

The determinant represents the volume of the parallelepiped spanned by the matrix's columns.

A matrix is invertible if and only if its determinant is non-zero.

### vector space, column space, null space

A vector space is a set of vectors that are closed under addition and scalar multiplication.

The column space of a matrix is the set of all possible linear combinations of its columns.

The null space of a matrix is the set of all vectors that, when multiplied by the matrix, give the zero vector.

### span

The span of a set of vectors is the set of all possible linear combinations of those vectors.

### basis

A basis is a set of linearly independent vectors that span the vector space.

### dimension

The dimension of a vector space is the number of vectors in a basis.

### rank

The rank of a matrix is the dimension of its column space.

### eigenvectors and eigenvalues

Eigenvectors are non-zero vectors that only get scaled (stretched or shrunk), not rotated, by a linear transformation.

Eigenvalues are the scalars by which the eigenvectors are scaled.

In simple terms, when you apply a matrix (representing a linear transformation) to an eigenvector, it just stretches or shrinks the vector, without changing its direction. The factor by which it stretches or shrinks is the eigenvalue.

NOTE: Pausing the study of this subject for now because it feels TOO NON-INTUITIVE. I may or may not come back to it.
