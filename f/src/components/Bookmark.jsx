import React, { useState } from 'react';
import PropTypes from 'prop-types';
import filledIcon from '../assets/bookmark_filled.png';
import outlineIcon from '../assets/bookmark_outline.png';
import '../styles/Bookmark.css';

function Bookmark({ isFavorite, onToggle }) {
  const [animate, setAnimate] = useState(false);

  const handleClick = () => {
    // Запускаем анимацию «пульс»
    setAnimate(true);
    // Вызываем родительский метод toggle
    onToggle();
  };

  // Когда анимация заканчивается, убираем класс
  const handleAnimationEnd = () => {
    setAnimate(false);
  };

  // Выбираем какую иконку показывать
  const iconSrc = isFavorite ? filledIcon : outlineIcon;

  return (
    <img
      src={iconSrc}
      alt="bookmark"
      className={`bookmark-icon ${animate ? 'bookmark-animate' : ''}`}
      onClick={handleClick}
      onAnimationEnd={handleAnimationEnd}
    />
  );
}

Bookmark.propTypes = {
  isFavorite: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default Bookmark;
