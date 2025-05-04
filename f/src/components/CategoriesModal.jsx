// import React, { useState, useEffect } from 'react';
// import api from '../utils/axiosInstance';
// import PropTypes from 'prop-types';
// import '../styles/CategoriesModal.css';

// function CategoriesModal({ isOpen, onClose, onAddCategories, alreadySelected, availableCategories }) {
//   const [allCategories, setAllCategories] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedCats, setSelectedCats] = useState([...alreadySelected]);

//   useEffect(() => {
//     if (isOpen) {
//       // Если передан список категорий от родителя, используем его.
//       if (availableCategories && availableCategories.length > 0) {
//         setAllCategories(availableCategories);
//       } else {
//         api.get('/categories')
//           .then((res) => {
//             setAllCategories(res.data);
//           })
//           .catch((err) => {
//             console.error('Ошибка при загрузке категорий:', err);
//           });
//       }
//       setSelectedCats([...alreadySelected]);
//     }
//   }, [isOpen, alreadySelected, availableCategories]);

//   const filteredCategories = allCategories.filter(cat =>
//     cat.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const isCatSelected = (catId) => selectedCats.some(c => c.id === catId);

//   const toggleCategory = (catObj) => {
//     setSelectedCats(prev => {
//       const found = prev.find(c => c.id === catObj.id);
//       return found ? prev.filter(c => c.id !== catObj.id) : [...prev, catObj];
//     });
//   };

//   const handleAdd = () => {
//     onAddCategories(selectedCats);
//     onClose();
//   };

//   const handleOverlayClick = () => onClose();
//   const handleModalClick = (e) => e.stopPropagation();

//   if (!isOpen) return null;

//   return (
//     <div className="categories-overlay" onClick={handleOverlayClick}>
//       <div className="categories-modal" onClick={handleModalClick}>
//         <button className="close-button" onClick={onClose}>×</button>
//         <h2>Choose Categories</h2>
//         <input
//           type="text"
//           placeholder="Search categories..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="categories-search-input"
//         />
//           <div className="categories-list">
//             {filteredCategories.map((cat, idx) => (
//               <div
//                 key={`${cat.id ?? 'noid'}-${idx}`}
//                 className={`category-item ${isCatSelected(cat.id) ? 'selected' : ''}`}
//                 onClick={() => toggleCategory(cat)}
//               >
//                 {cat.name}
//               </div>
//             ))}
//         </div>
//         <button className="add-categories-button" onClick={handleAdd}>
//           Add Categories
//         </button>
//       </div>
//     </div>
//   );
// }

// CategoriesModal.propTypes = {
//   isOpen: PropTypes.bool.isRequired,
//   onClose: PropTypes.func.isRequired,
//   onAddCategories: PropTypes.func.isRequired,
//   alreadySelected: PropTypes.arrayOf(
//     PropTypes.shape({
//       id: PropTypes.number.isRequired,
//       name: PropTypes.string.isRequired
//     })
//   ),
//   availableCategories: PropTypes.arrayOf(
//     PropTypes.shape({
//       id: PropTypes.number.isRequired,
//       name: PropTypes.string.isRequired
//     })
//   )
// };

// export default CategoriesModal;
import React, { useState, useEffect } from 'react';
import api from '../utils/axiosInstance';
import PropTypes from 'prop-types';
import '../styles/CategoriesModal.css';

 function CategoriesModal({
     isOpen,
     onClose,
     onAddCategories,
     alreadySelected = [],
     availableCategories = []
   }) {
     const [allCategories, setAllCategories] = useState([]);
     const [searchQuery, setSearchQuery] = useState('');
     const [selectedCats, setSelectedCats] = useState([]);

     useEffect(() => {
      if (isOpen) {
       // Сбрасываем поиск и выделение при каждом открытии
       setSearchQuery('');
        setSelectedCats([...alreadySelected]);
 
        if (availableCategories.length) {
          setAllCategories([...availableCategories]);
        } else {
          api.get('/categories')
            .then(res => setAllCategories(res.data))
            .catch(err => console.error(err));
        }
      }
   }, [isOpen, alreadySelected, availableCategories]);

  const filteredCategories = allCategories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const toggleCategory = (catObj) => {
    setSelectedCats(prev => {
      const found = prev.find(c => c.id === catObj.id);
      return found ? prev.filter(c => c.id !== catObj.id) : [...prev, catObj];
    });
  };

  const handleAdd = () => {
    onAddCategories(selectedCats);
    onClose();
  };

  const handleOverlayClick = () => onClose();
  const handleModalClick = (e) => e.stopPropagation();

  if (!isOpen) return null;

  return (
    <div className="categories-overlay" onClick={handleOverlayClick}>
      <div className="categories-modal" onClick={handleModalClick}>
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Choose Categories</h2>
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="categories-search-input"
        />
          <div className="categories-list">
                    {filteredCategories.map((cat, idx) => (
            <div
              key={`${(cat.id ?? cat.name)}-${idx}`}
              className={`category-item ${selectedCats.some(c => c.id === cat.id) ? 'selected' : ''}`}
              onClick={() => toggleCategory(cat)}
            >
              {cat.name}
            </div>
          ))}
        </div>
        <button className="add-categories-button" onClick={handleAdd}>
          Add Categories
        </button>
      </div>
    </div>
  );
}

CategoriesModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAddCategories: PropTypes.func.isRequired,
  alreadySelected: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    })
  ),
  availableCategories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    })
  )
};

export default CategoriesModal;
