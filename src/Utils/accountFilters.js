export function getFilteredAndSortedAccounts(accounts, searchQuery, sortBy) {
  let filtered = accounts;

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = accounts.filter((acc) => acc.name.toLowerCase().includes(query));
  }

  return [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "time-newest":
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      case "time-oldest":
        return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
      default:
        return 0;
    }
  });
}
