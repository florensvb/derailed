<template>
  <v-layout justify-space-between column>
    <div>
      <v-toolbar flat color="#424242">
        <v-toolbar-title>Tickets that can get me out of here</v-toolbar-title>
      </v-toolbar>
      <v-data-table
        :headers="headers"
        :items="tickets"
        :loading="loading"
        class="elevation-1"
        hide-actions
      >
        <template v-slot:items="props">
          <td>{{ `${randomTrain()} ${props.item.train}` }}</td>
          <td>{{ `🕓 ${require('moment')(props.item.departure).calendar()}` }}</td>
          <td>{{ props.item.train_type }}</td>
          <td>
            <v-btn
              :disabled="alreadyOwns(props.item)"
              :loading="loading"
              @click="buyTicket(props.item)"
              class="mr-2"
              fab
              flat
              small
            >
              <v-icon small>
                shopping_cart
              </v-icon>
            </v-btn>
          </td>
        </template>
      </v-data-table>
    </div>

    <div>
      <v-toolbar flat color="#424242">
        <v-toolbar-title>Tickets I already own</v-toolbar-title>
      </v-toolbar>
      <v-data-table
        :headers="headers"
        :items="userTickets"
        :loading="loading"
        class="elevation-1"
        hide-actions
      >
        <template v-slot:items="props">
          <td>{{ `${randomTrain()} ${props.item.train}` }}</td>
          <td>{{ `🕓 ${require('moment')(props.item.departure).calendar()}` }}</td>
          <td>{{ props.item.train_type }}</td>
          <td>
            <v-btn
              :loading="loading"
              @click="sellTicket(props.item)"
              class="mr-2"
              fab
              flat
              small
            >
              <v-icon small>
                delete
              </v-icon>
            </v-btn>
          </td>
        </template>
      </v-data-table>
    </div>
  </v-layout>
</template>

<script>
import _ from 'lodash'

export default {
    data () {
        return {
            tickets: [],
            userTickets: [],
            trains: ['🚞', '🚟', '🚂', '🚃', '🚄', '🚅', '🚆', '🚈', '🚉', '🚊', '🚋', '💺', '🚝', '🛤'],
            loading: true,
            headers: [
                { text: 'Train', value: 'train' },
                { text: 'Departure', value: 'departure' },
                { text: 'Type', value: 'train_type' },
                { text: 'Actions', value: 'name', sortable: false }
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
          randomTrain() {
            return _.sample(this.trains);
          },
          alreadyOwns(ticket) {
            return this.userTickets.map(ut => ut.id).includes(ticket.id);
          },
          async buyTicket(ticket) {
          this.loading = true;
          try {
            await this.$axios.post('/add-ticket', {
              ticket_id: ticket.id,
            });

            await this.getUserTickets();
          } catch (e) {
            // Snackbar?
          }
          this.loading = false;
        },
      async sellTicket(ticket) {
          this.loading = true;
          try {
            await this.$axios.post('/remove-ticket', {
              ticket_id: ticket.id,
            });

            await this.getUserTickets();
          } catch (e) {
            // Snackbar?
          }
          this.loading = false;
        },
        async getTickets() {
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
