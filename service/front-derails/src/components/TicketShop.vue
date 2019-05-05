<template>
  <v-data-table
    :headers="headers"
    :items="tickets"
    :loading="loading"
    class="elevation-1"
  >
    <template v-slot:items="props">
      <td>{{ props.item.train }}</td>
      <td>{{ require('moment')(props.item.departure).calendar() }}</td>
      <td>{{ props.item.train_type }}</td>
    </template>
  </v-data-table>
</template>

<script>
export default {
    data () {
        return {
            tickets: [],
            loading: true,
            headers: [
                { text: 'Train', value: 'train' },
                { text: 'Departure', value: 'departure' },
                { text: 'Type', value: 'train_type' },
            ].map(header => {
                return {
                    ...header,
                    align: 'left',
                }
            })
        }
    },
    mounted () {
        this.getTickets();
    },
    methods: {
        async getTickets () {
            this.loading = true;
            try {
                const { data: tickets } = await this.$axios.get('/tickets');
                this.tickets = tickets;
            } catch (e) {
                console.error(e);
            }
            this.loading = false;
        },
    }
}
</script>
