const fields = {
  Project: 'customId title description category location area budget status completionDate imageUrl beforeImageUrl images videos pdfs year duration materials',
  Gallery: 'title category imageUrl videoUrl desc alt description',
  HousePlan: 'customId title category bedrooms bathrooms floors beds baths cars area imageUrl previewImage pdfUrl pdf description specs',
  Blog: 'title slug content imageUrl featuredImage category tags published excerpt author',
  Service: 'title description icon image imageUrl details',
  Testimonial: 'name clientName role rating review photo',
};
export const writableFields = (model, input) => Object.fromEntries(fields[model].split(' ').filter(key => Object.hasOwn(input, key)).map(key => [key, input[key]]));
