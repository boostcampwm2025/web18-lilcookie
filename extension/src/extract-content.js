import { Readability, isProbablyReaderable } from '@mozilla/readability';

function extractContent() {
  try {
    if (!isProbablyReaderable(document)) {
      return null;
    }
    const documentClone = document.cloneNode(true);
    const article = new Readability(documentClone).parse();
    return article;
  } catch (error) {
    return null;
  }
}

export default extractContent();
