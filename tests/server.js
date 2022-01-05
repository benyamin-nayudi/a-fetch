const express = require('express')
let assert = require('assert')
const app = express()
const port = 3000
const Fetcher = require('a-fetch').Fetcher
const Router = require('a-fetch').Router
const axios = require('axios')

const client = axios.create({
    baseURL: 'https://jsonplaceholder.typicode.com'
})

Router.baseURL('https://jsonplaceholder.typicode.com')
    .index('todos', '/todos')
    .show('todos', '/todos/{id}')
    .store('todos', '/todos')
    .update('todos', '/todos/{id}')
    .delete('todos', '/todos/{id}')

Router.api('laravel-api', 'http://127.0.0.1:8000')
    // Category routes
    .index('categories', '/api/categories')
    .show('categories', '/api/categories/{id}')
    .store('category', '/api/categories')
    .update('category', '/api/categories/{id}')
    .delete('category', '/api/categories/{id}')
    // User routes
    .show('user', '/api/user')

Router.api('todos')
    .axiosClient(client)
    .index('todos', '/todos')

app.get('/categories', (req, res) => {
    Fetcher.api('laravel-api')
        .bearerToken('21|oxlYLHz9IDRoMNbAzLfWRwoNRXv1s5L7fvvsA63P')
        .show('user')
        .then(response => {
            assert.strictEqual(response.loading, false)
            assert.strictEqual(response.data.email, 'info@bespokeweb.nl')
        })

    Fetcher.api('laravel-api')
        .show('user', {bearer_token: '21|oxlYLHz9IDRoMNbAzLfWRwoNRXv1s5L7fvvsA63P'})
        .then(response => {
            assert.strictEqual(response.loading, false)
            assert.strictEqual(response.data.email, 'info@bespokeweb.nl')
        })

    Fetcher.api('laravel-api').index('categories', {paginate: 5}, [{id: 1, name: 'kids', label: 'Kids'}]).then(response => {
        assert.strictEqual(response.loading, false)
        assert.strictEqual(response.data.length, 6)
        assert.strictEqual(response.meta.current_page, 1)
        assert.strictEqual(response.data[0].id, 1)
        assert.strictEqual(response.data[0].name, 'kids')
    })

    Fetcher.api('laravel-api').show('categories', {id: 2}).then(response => {
        assert.strictEqual(response.loading, false)
        assert.strictEqual(response.data.id, 2)
        assert.strictEqual(response.data.name, 'heren')
    })

    let category = {label: 'Dames'}
    Fetcher.api('laravel-api').store('category', category).then(response => {
        assert.strictEqual(response.loading, false)
        assert.deepStrictEqual(response.errors, [
            {
                field: 'name',
                message: 'Input field name is missing from the Request.'
            }
        ])
    })

    category = {label: 'Dames', name: 'dames'}
    Fetcher.api('laravel-api').store('category', category).then(response => {
        assert.strictEqual(response.loading, false)
        assert.strictEqual(response.data.id > 0, true)
        assert.strictEqual(response.data.name, 'dames')
        assert.strictEqual(response.data.label, 'Dames')
    })

    Fetcher.api('laravel-api').store('category', category, [{id: 1, name: 'kids', label: 'Kids'}]).then(response => {
        assert.strictEqual(response.loading, false)
        assert.strictEqual(response.data.length, 2)
        assert.strictEqual(response.data[0].id, 1)
        assert.strictEqual(response.data[0].name, 'kids')
    })

    return res.send('All tests passed!')

    const name = Math.floor(Math.random() * 10) + 1;
    Fetcher.api('laravel-api').update('category', {id: 3, label: name , name}).then(response => {
        assert.strictEqual(response.loading, false)
        assert.strictEqual(response.data.id, 3)
        assert.strictEqual(response.data.name, name)
        assert.strictEqual(response.data.label, name)
    })

    Fetcher.api('laravel-api').update('category', {id: 4, name: 'heren', label: 'heren'}, [{id: 4, name: 'kids', label: 'Kids'}]).then(response => {
        assert.strictEqual(response.loading, false)
        assert.strictEqual(response.data[0].id, 4)
        assert.strictEqual(response.data[0].name, 'heren')
        assert.strictEqual(response.data.length, 1)
    })

    Fetcher.api('laravel-api').delete('category', {id: 21}).then(response => {
        assert.strictEqual(response.loading, false)
        assert.strictEqual(response.deleted, true)
    })

    Fetcher.api('laravel-api').delete('category', {id: 22}, [{id: 22, name: 'kids', label: 'Kids'}]).then(response => {
        assert.strictEqual(response.data.length, 0)
        assert.strictEqual(response.loading, false)
    })

    res.send('All tests passed!')
})

app.get('/', (req, res) => {
    Fetcher.index('todos').then(response => {
        assert.strictEqual(response.data.length, 200, 'Cannot index')
    })

    // Test custom axios client
    Fetcher.api('todos').index('todos').then(response => {
        assert.strictEqual(response.data.length, 200, 'Cannot index')
    })

    Fetcher.index('todos', {id: 1}).then(response => {
        assert.strictEqual(response.data.length, 1)
        assert.strictEqual(response.data[0].id, 1, 'Cannot index with params')
    })

    Fetcher.show('todos', {id: 1}).then(response => {
        assert.strictEqual(response.data.id, 1, 'Cannot show')
    })

    let show_collection = [{id: 1}, {id: 2}]
    Fetcher.records([show_collection[0]]).show('todos', show_collection[1]).then(response => {
        assert.strictEqual(response.data.id, 2, 'Cannot show')
        assert.strictEqual(response.records.length, 2, 'Cannot update')
        assert.strictEqual(response.records[0].id, 1, 'Cannot show')
        assert.strictEqual(response.records[1].id, 2, 'Cannot show')
    })

    let store = {title: 'delectus aut autem', completed: 'true'}
    Fetcher.store('todos', store).then(response => {
        assert.strictEqual(response.data.id, 201, 'Cannot store')
    })

    Fetcher.records().store('todos', store).then(response => {
        assert.strictEqual(response.data.id, 201, 'Cannot store')
        assert.deepStrictEqual(response.records, [{...store, id: 201}], 'Cannot store')
    })

    let update = {id: 1, title: 'delectus aut autem', completed: 'true'}
    Fetcher.update('todos', update).then(response => {
        assert.strictEqual(response.data.id, 1, 'Cannot update')
    })

    let update_collection = [{id: 1, title: 'test1'}, {id: 2, title: 'test2'}]
    Fetcher.records(update_collection).update('todos', {id: 2, title: 'test3'}).then(response => {
        assert.strictEqual(response.data.id, 2, 'Cannot update')
        assert.strictEqual(response.records.length, 2, 'Cannot update, length incorrect')
        assert.strictEqual(response.records[0], update_collection[0], 'Cannot update, id record 1 incorrect')
        assert.strictEqual(response.records[1].id, 2, 'Cannot update, id record 2 incorrect')
        assert.strictEqual(response.records[1].title, 'test3', 'Cannot update, title record 2 incorrect')
    })

    Fetcher.delete('todos', {id: 1}).then(response => {
        assert.strictEqual(!!response.data, true, 'Cannot delete')
    })

    let delete_collection = [{id: 1, title: 'test1'}, {id: 2, title: 'test2'}]
    Fetcher.records(delete_collection).delete('todos', {id: 1}).then(response => {
        assert.strictEqual(!!response.data, true, 'Cannot delete')
        assert.deepStrictEqual(response.records, [delete_collection[1]], 'Cannot delete')
    })


    res.send('All tests passed!')
})

app.listen(port, () => console.log(`Example app listening on port http://localhost${port}!`))
