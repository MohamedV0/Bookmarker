const DOM = {
  siteName: document.getElementById("bookmarkName"),
  siteURL: document.getElementById("bookmarkURL"),
  siteCategory: document.getElementById("bookmarkCategory"),
  submitBtn: document.getElementById("submitBtn"),
  tableContent: document.getElementById("tableContent"),
  searchInput: document.getElementById("searchInput"),
  categoryFilter: document.getElementById("categoryFilter"),
  sortOption: document.getElementById("sortOption")
};

const PATTERNS = {
  name: /^\w{3,}(\s+\w+)*$/,
  url: /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/
};

const BookmarkManager = {
  bookmarks: [],
  
  init() {
    this.loadFromStorage();
    this.setupEventListeners();
  },
  
  loadFromStorage() {
    const storedBookmarks = localStorage.getItem("bookmarksList");
    if (storedBookmarks) {
      this.bookmarks = JSON.parse(storedBookmarks);
      UI.displayAllBookmarks(this.bookmarks);
    }
  },
  
  saveToStorage() {
    localStorage.setItem("bookmarksList", JSON.stringify(this.bookmarks));
  },
  
  addBookmark(bookmark) {
    this.bookmarks.push(bookmark);
    this.saveToStorage();
    return this.bookmarks.length - 1;
  },
  
  deleteBookmark(index) {
    this.bookmarks.splice(index, 1);
    this.saveToStorage();
  },
  
  filterAndSort(searchTerm = "", category = "", sortOption = "newest") {
    let filtered = [...this.bookmarks];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(bookmark => 
        bookmark.siteName.toLowerCase().includes(term) || 
        bookmark.siteURL.toLowerCase().includes(term)
      );
    }
    
    if (category) {
      filtered = filtered.filter(bookmark => bookmark.category === category);
    }
    
    switch(sortOption) {
      case "newest":
        filtered.sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.dateAdded || 0) - new Date(b.dateAdded || 0));
        break;
      case "nameAsc":
        filtered.sort((a, b) => a.siteName.localeCompare(b.siteName));
        break;
      case "nameDesc":
        filtered.sort((a, b) => b.siteName.localeCompare(a.siteName));
        break;
    }
    
    return filtered;
  },
  
  formatURL(url) {
    return {
      displayURL: url,
      visitURL: url.startsWith('http') ? url : `https://${url}`
    };
  },
  
  setupEventListeners() {
    DOM.submitBtn.addEventListener("click", this.handleSubmit.bind(this));
    
    DOM.siteName.addEventListener("input", () => Validator.validateInput(DOM.siteName, PATTERNS.name));
    DOM.siteURL.addEventListener("input", () => Validator.validateInput(DOM.siteURL, PATTERNS.url));
    
    DOM.searchInput.addEventListener("input", this.handleFiltering.bind(this));
    DOM.categoryFilter.addEventListener("change", this.handleFiltering.bind(this));
    DOM.sortOption.addEventListener("change", this.handleFiltering.bind(this));
    
    DOM.tableContent.addEventListener("click", (e) => {
      const target = e.target.closest("button");
      if (!target) return;
      
      const index = parseInt(target.dataset.index, 10);
      
      if (target.classList.contains("btn-visit")) {
        this.visitBookmark(index);
      } else if (target.classList.contains("btn-delete")) {
        this.confirmDelete(index);
      }
    });
  },
  
  handleSubmit() {
    if (!Validator.isFormValid()) {
      Swal.fire(SweetAlertConfig.validationError);
      return;
    }

    const newUrl = DOM.siteURL.value;
    if (Validator.isUrlDuplicate(newUrl)) {
      showNotification('error', 'Duplicate URL', 'This website is already bookmarked!');
      return;
    }

    const newBookmark = {
      siteName: Utilities.capitalize(DOM.siteName.value),
      siteURL: newUrl,
      category: DOM.siteCategory.value || "Other",
      dateAdded: new Date().toISOString()
    };
    
    this.addBookmark(newBookmark);
    UI.displayAllBookmarks(this.bookmarks);
    UI.clearForm();
    showNotification('success', 'Bookmark Added', 'Your bookmark has been added successfully!');
  },
  
  handleFiltering() {
    const searchTerm = DOM.searchInput.value;
    const category = DOM.categoryFilter.value;
    const sortBy = DOM.sortOption.value;
    
    const filteredBookmarks = this.filterAndSort(searchTerm, category, sortBy);
    UI.displayAllBookmarks(this.bookmarks, filteredBookmarks);
  },
  
  visitBookmark(index) {
    const { visitURL } = this.formatURL(this.bookmarks[index].siteURL);
    window.open(visitURL, '_blank');
  },
  
  confirmDelete(index) {
    const bookmarkName = this.bookmarks[index].siteName;
    const config = {
      ...SweetAlertConfig.deleteConfirm,
      text: `You are about to delete "${bookmarkName}"`
    };
    
    Swal.fire(config).then((result) => {
      if (result.isConfirmed) {
        this.deleteBookmark(index);
        UI.displayAllBookmarks(this.bookmarks);
        showNotification('success', 'Deleted!', 'Your bookmark has been deleted.');
      }
    });
  }
};

const UI = {
  displayAllBookmarks(allBookmarks, filteredBookmarks = null) {
    const bookmarksToDisplay = filteredBookmarks || allBookmarks;
    DOM.tableContent.innerHTML = "";
    
    if (bookmarksToDisplay.length === 0) {
      this.showEmptyState();
      return;
    }
    
    bookmarksToDisplay.forEach((bookmark, i) => {
      const originalIndex = filteredBookmarks 
        ? allBookmarks.findIndex(item => item === bookmark)
        : i;
      
      this.renderBookmarkRow(bookmark, originalIndex);
    });
  },
  
  renderBookmarkRow(bookmark, index) {
    const { displayURL } = BookmarkManager.formatURL(bookmark.siteURL);
    const category = bookmark.category || "Other";
    const categoryClass = `category-${category}`;
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${bookmark.siteName}</td>
      <td class="d-none d-md-table-cell">
        <span class="category-badge ${categoryClass}">${category}</span>
      </td>              
      <td>
        <button class="btn btn-visit" data-index="${index}">
          <i class="fa-solid fa-eye pe-2"></i>Visit
        </button>
      </td>
      <td>
        <button class="btn btn-delete pe-2" data-index="${index}">
          <i class="fa-solid fa-trash-can"></i>
          Delete
        </button>
      </td>
    `;
    
    DOM.tableContent.appendChild(row);
  },
  
  showEmptyState() {
    DOM.tableContent.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-4">
          <i class="fa-solid fa-search fa-2x mb-3 text-secondary"></i>
          <p class="mb-0">No bookmarks found</p>
        </td>
      </tr>
    `;
  },
  
  clearForm() {
    DOM.siteName.value = "";
    DOM.siteURL.value = "";
    DOM.siteCategory.value = "";
    
    DOM.siteName.classList.remove("is-valid", "is-invalid");
    DOM.siteURL.classList.remove("is-valid", "is-invalid");
  }
};

const Validator = {
  validateInput(element, pattern) {
    const isValid = pattern.test(element.value);
    
    if (isValid) {
      element.classList.add("is-valid");
      element.classList.remove("is-invalid");
    } else {
      element.classList.add("is-invalid");
      element.classList.remove("is-valid");
    }
    
    return isValid;
  },
  
  isFormValid() {
    const isNameValid = this.validateInput(DOM.siteName, PATTERNS.name);
    const isUrlValid = this.validateInput(DOM.siteURL, PATTERNS.url);
    return isNameValid && isUrlValid;
  },

  isUrlDuplicate(url) {
    return BookmarkManager.bookmarks.some(bookmark => 
      bookmark.siteURL.toLowerCase() === url.toLowerCase()
    );
  }
};

const Utilities = {
  capitalize(str) {
    if (!str || str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  BookmarkManager.init();
});
