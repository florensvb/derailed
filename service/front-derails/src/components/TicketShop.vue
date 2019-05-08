<template>
  <v-layout justify-space-between column>
    <div>
      <v-toolbar flat color="#424242">
        <v-toolbar-title>Tickets out of here</v-toolbar-title>
      </v-toolbar>
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
    </div>

    <div>
      <v-toolbar flat color="#424242">
        <v-toolbar-title>Tickets I own</v-toolbar-title>
      </v-toolbar>
      <v-data-table
        :headers="headers"
        :items="userTickets"
        :loading="loading"
        class="elevation-1"
      >
        <template v-slot:items="props">
          <td>{{ props.item.train }}</td>
          <td>{{ require('moment')(props.item.departure).calendar() }}</td>
          <td>{{ props.item.train_type }}</td>
        </template>
      </v-data-table>
    </div>
  </v-layout>
</template>

<script>
export default {
    data () {
        return {
            tickets: [],
            userTickets: [],
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
        this.getUserTickets();
    },
    methods: {
        async getTickets () {
            this.loading = true;
            try {
                const { data: tickets } = await this.$axios.get('/tickets');
                this.tickets = tickets;
            } catch (e) {
                // Snackbar?
            }
            this.loading = false;
        },
      async getUserTickets () {
            this.loading = true;
            try {
                const { data: userTickets } = await this.$axios.get('/my-tickets');
                this.userTickets = userTickets;
            } catch (e) {
                // Snackbar?
            }
            this.loading = false;
        },
    }
}
</script>
