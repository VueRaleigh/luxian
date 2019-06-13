<template>
    <div>
        <h1>Test component</h1>
        <label for="b1">Click to fetch results</label>
        <button id="b1" @click="fetchResults" />
        <p>this is a test component with a "{{ value }}"</p>
    </div>
</template>

<script>

import axios from 'axios';

export default {
    data() {
        return {
            value: ''
        };
    },
    methods: {
      async fetchResults() {
        const response = await axios.get('mock/service')
        this.value = response.data
      }
    }
}
</script>
