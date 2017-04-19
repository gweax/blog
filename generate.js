var Metalsmith = require('metalsmith'),
    markdown = require('metalsmith-markdown'),
    layouts = require('metalsmith-layouts'),
    drafts = require('metalsmith-drafts'),
    beautify = require('metalsmith-beautify'),
    collections = require('metalsmith-collections'),
    permalinks = require('metalsmith-permalinks'),
    pagination = require('metalsmith-pagination'),
    excerpt = require('metalsmith-excerpts'),
    copy = require('metalsmith-copy'),
    moment = require('moment');

function prettyDate() {
    return function(files, metalsmith, done) {
        setImmediate(done);

        Object.keys(files).forEach(function(path) {
            var file = files[path];
            file.prettyDate = moment(file.date).format('MMMM Do YYYY');
        });
    }
}


Metalsmith(__dirname)
    .source('./src')
    .destination('./build')
    .clean(true)
    .use(drafts())
    .use(collections({
        posts: {
            pattern: 'posts/*.md',
            sortBy: 'date',
            reverse: true
        }
    }))
    .use(markdown({
        smartypants: true,
        gfm: true,
        tables: true
    }))
    .use(prettyDate())
    .use(excerpt())
    .use(permalinks({
        date: 'YYYY/MM',

        linksets: [{
            match: { collection: 'posts' },
            pattern: 'blog/:date/:title'
        }]
    }))
    .use(pagination({
        'collections.posts': {
            perPage: 5,
            first: 'index.html',
            path: 'blog/page/:num/index.html',
            layout: 'index.html'
        }
    }))
    .use(copy({
        pattern: 'blog/page/1/index.html',
        directory: 'blog'
    }))
    .use(layouts({
        engine: 'mustache',
        pattern: '**/*.html',
        directory: 'layouts',
        partials: 'layouts/partials',
        default: 'article.html'
    }))
    .use(beautify({
        indent_size: 2,
        indent_char: ' ',
        html: {
            wrap_line_length: 120
        }
    }))
    .build(function(err) {
        if (err) {
            console.warn(err);
        }
    });