"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";

interface Book {
  ISBN_13: string;
  cover?: string;
  title: string;
  author: string;
  publisher: string;
  ebook: string;
}

export default function Home() {
  const [isbn, setIsbn] = useState<string>("");
  const [book, setBook] = useState<Book | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const booksPerPage = 3;

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    setFilteredBooks(
      books.filter(
        (book) =>
          book.title.toLowerCase().includes(term) ||
          book.author.toLowerCase().includes(term) ||
          book.publisher.toLowerCase().includes(term)
        // book.year.toLowerCase().includes(term) ||
      )
    );
    setCurrentPage(1);
  }, [searchTerm, books]);

  const fetchBooks = async () => {
    try {
      const response = await axios.get<Book[]>(
        `${process.env.NEXT_PUBLIC_API}/books`
      );
      setBooks(response.data);
      setFilteredBooks(response.data);
    } catch (error) {
      console.error("Error fetching books", error);
    }
  };

  const fetchBookData = async (isbn: string) => {
    try {
      setError(null);
      setMessage("");
      const response = await axios.get<{ data: Book; message: string }>(
        `http://192.168.100.60:3001/isbn/${isbn}`
      );
      if (response.data) {
        const bookData = response.data.data;
        setBook(bookData);
        setBooks([bookData, ...books]);
        setMessage(response.data.message);
        setIsbn("");

        setError(null);
      } else {
        setError("Book not found");
      }
    } catch (error: any) {
      console.error("Error fetching book data", error);
      setError(error.response.data.message);
      setIsbn("");
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchBookData(isbn);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mb-8">
        <h1 className="text-2xl font-bold mb-4 text-center">Book Scanner</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="&#x1F50D; Enter ISBN"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-300"
          >
            Add book
          </button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {book && <p className="text-black-800 mt-4">{message}</p>}
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Scanned Books</h2>
        <input
          type="text"
          placeholder="&#x1F50D; Search by title"
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Thumbnail</th>
                <th className="px-4 py-2 border">Title</th>
                <th className="px-4 py-2 border">Authors</th>
                <th className="px-4 py-2 border">Publisher</th>
                <th className="px-4 py-2 border">E-Book</th>
              </tr>
            </thead>
            <tbody>
              {currentBooks.map((book) => (
                <tr key={book.ISBN_13}>
                  <td className="px-4 py-2 border">
                    {book.cover && (
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="w-16 h-auto"
                      />
                    )}
                  </td>
                  <td className="px-4 py-2 border">{book.title}</td>
                  <td className="px-4 py-2 border">{book.author}</td>
                  <td className="px-4 py-2 border">{book.publisher}</td>
                  <td className="px-4 py-2 border">{book.ebook}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {books.length > booksPerPage && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
