const formatToReadableString = (array, conjunction = 'and') => {
  const tempArray = [...array];
  tempArray[tempArray.length - 1] =
    conjunction + ' ' + tempArray[tempArray.length - 1];
  return tempArray.join(', ');
};

module.exports = {
  formatToReadableString,
};
