const str = '{data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZ,data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA}';
const matches = str.match(/(data:image\/[^;]+;base64,[A-Za-z0-9+/=]+|https?:\/\/[^\s"',\}]+)/g);
console.log("MATCHES:", matches);
