const express = require('express');

const app = express();

app.get('/route/:fparam(a|b|c)/:sparam(d|e|f)/:tparam(g|h|i)', (req, res) => {
    const params = req.params;
    res.status(200).end(`${params.fparam} ${params.sparam} ${params.tparam}`);
});

app.get('/sitemap', (req, res)=> {
    const fh = 'http://localhost:8000';
    const routes = app._router.stack.map((r) => r.route ? r.route.path : null).filter((r) => r!=null)
    const realRoutes = parseRoutes(routes);
    const flattened = flattenArray(realRoutes);
    const sitemapOutput = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
      ${flattened.map((r) => `<url><loc>${fh}${r}</loc></url>`).join('')}
    </urlset>`;
    res.status(200).end(sitemapOutput);
})

function parsePattern(subPattern) {
    let acceptedValues = subPattern ? subPattern.match(/\((\|?([a-z0-9-]+)\|?)+\)/ig) : null;
    if(acceptedValues) {
        acceptedValues = acceptedValues && acceptedValues.length ? acceptedValues[0].substr(1, acceptedValues[0].length - 2).split('|') : null;
        const urlMap = acceptedValues ? acceptedValues.map((param) => {
            const optionRegex = new RegExp(`\\((([a-z0-9-]+\\|)+)?(${param})((\\|[a-z0-9-]+)+)?\\)`, 'ig');
            return subPattern.replace(optionRegex, `$3`);
        }) : null;
        return(parseRoutes(urlMap));
    }

    return subPattern;
}

function parseRoutes(routes) {
    //console.log(routes);
    const realRoutes = routes.map((route) => {
        const subPattern = route.replace(/(:[a-z]+)?(\(([a-z0-9-]+\|?)+\))+/ig, `$2`);
        // console.log('SUB', subPattern);
        const acceptedValues = parsePattern(subPattern);
        // console.log(acceptedValues); 

        return acceptedValues;
    });

    return realRoutes;
}

function flattenArray(arr) {
    const isNotFlat = arr.filter((a)=> typeof a==='object');
    console.log(isNotFlat);
    if(isNotFlat.length) {
        const newFlat = [].concat.apply([], arr);
        return flattenArray(newFlat);
    }
    return arr;
}

app.listen(8000);