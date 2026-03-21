const db = require('../db');

const createBook = async (bookData) => {
    const {
        sellerId, sellerName, sellerUniversity, title, author,
        isbn, moduleCode, edition, condition, price,
        description, pickupLocation, pickupNotes
    } = bookData;

    const result = await db.query(
        `INSERT INTO books 
      (seller_id, seller_name, seller_university, title, author, isbn,
       module_code, edition, condition, price, description, pickup_location, pickup_notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING *`,
        [sellerId, sellerName, sellerUniversity, title, author, isbn,
            moduleCode, edition, condition, price || null, description, pickupLocation, pickupNotes]
    );
    return result.rows[0];
};

const findAll = async (filters = {}, pagination = {}) => {
    const { search, moduleCode, university, condition, maxPrice, status = 'available' } = filters;
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];

    conditions.push(`status = $${params.length + 1}`);
    params.push(status);

    if (search) {
        conditions.push(`(title ILIKE $${params.length + 1} OR author ILIKE $${params.length + 1})`);
        params.push(`%${search}%`);
    }
    if (moduleCode) {
        conditions.push(`module_code ILIKE $${params.length + 1}`);
        params.push(`%${moduleCode}%`);
    }
    if (university) {
        conditions.push(`seller_university ILIKE $${params.length + 1}`);
        params.push(`%${university}%`);
    }
    if (condition) {
        conditions.push(`condition = $${params.length + 1}`);
        params.push(condition);
    }
    if (maxPrice) {
        conditions.push(`(price IS NULL OR price <= $${params.length + 1})`);
        params.push(maxPrice);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await db.query(`SELECT COUNT(*) FROM books ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    const booksResult = await db.query(
        `SELECT * FROM books ${where} ORDER BY created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
    );

    return { books: booksResult.rows, total };
};

const findById = async (id) => {
    const result = await db.query(
        `UPDATE books SET view_count = view_count + 1 WHERE id = $1 RETURNING *`,
        [id]
    );
    return result.rows[0];
};

const findBySellerId = async (sellerId) => {
    const result = await db.query(
        `SELECT * FROM books WHERE seller_id = $1 AND status != 'removed' ORDER BY created_at DESC`,
        [sellerId]
    );
    return result.rows;
};

const updateBook = async (id, fields) => {
    const {
        title, author, isbn, moduleCode, edition,
        condition, price, description, pickupLocation, pickupNotes
    } = fields;

    const result = await db.query(
        `UPDATE books SET
      title = COALESCE($1, title),
      author = COALESCE($2, author),
      isbn = COALESCE($3, isbn),
      module_code = COALESCE($4, module_code),
      edition = COALESCE($5, edition),
      condition = COALESCE($6, condition),
      price = COALESCE($7, price),
      description = COALESCE($8, description),
      pickup_location = COALESCE($9, pickup_location),
      pickup_notes = COALESCE($10, pickup_notes),
      updated_at = NOW()
     WHERE id = $11 RETURNING *`,
        [title, author, isbn, moduleCode, edition, condition,
            price, description, pickupLocation, pickupNotes, id]
    );
    return result.rows[0];
};

const removeBook = async (id) => {
    const result = await db.query(
        `UPDATE books SET status = 'removed', updated_at = NOW() WHERE id = $1 RETURNING *`,
        [id]
    );
    return result.rows[0];
};

const updateStatus = async (id, status) => {
    const result = await db.query(
        `UPDATE books SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [status, id]
    );
    return result.rows[0];
};

module.exports = {
    createBook,
    findAll,
    findById,
    findBySellerId,
    updateBook,
    removeBook,
    updateStatus,
};