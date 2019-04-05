import Document, { Head, Main, NextScript } from "next/document";

export default class CustomDocument extends Document {
  render() {
    return (
      <html lang="en">
        <Head>
          <style
            dangerouslySetInnerHTML={{
              __html: `
            body { 
              margin: 0;
              font-family: 'Lato', sans-serif;
              box-sizing:border-box;
              overflow-x: hidden;
            }

            a {
              color: inherit;
            }  

            * {box-sizing: inherit}

            /* from Google Fonts */
            @font-face {
              font-family: 'Lato';
              font-style: normal;
              font-weight: 400;
              src: local('Lato Regular'), local('Lato-Regular'), url(https://fonts.gstatic.com/s/lato/v15/S6uyw4BMUTPHjx4wXg.woff2) format('woff2');
              unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }
            `
            }}
          />
          <meta
            name="viewport"
            content="initial-scale=1, minimum-scale=1, width=device-width"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
