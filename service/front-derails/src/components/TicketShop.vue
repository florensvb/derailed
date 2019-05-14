<template>
  <v-container fluid grid-list-md>
    <div>
      <v-timeline>
        <v-timeline-item
          v-for="train in trains"
          :key="train.id"
          color="red lighten-1"
          small
        >
          <template v-slot:opposite>
            <span>{{ require('moment')(train.departure).calendar() }}</span>
          </template>
          <v-card class="elevation-20">
            <v-card-title class="headline">{{ train.name }}</v-card-title>
            <v-card-text>
              <div>{{ `Arrival: ${require('moment')(train.arrival).calendar()}` }}</div>
              <div>{{ `From: ${train.from}`}}</div>
              <div>{{ `To: ${train.to}`}}</div>
              <div>{{ `Track: ${train.track}`}}</div>
            </v-card-text>
            <v-card-actions class="row justify-center">
              <v-btn
                :disabled="alreadyOwns(train)"
                :loading="loading"
                @click="buyTicket(train)"
                outline
                flat
                small
              >
                Get on train
                <v-icon right small>
                  train
                </v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-timeline-item>
      </v-timeline>
    </div>

    <v-divider/>

    <div class="elevation-20">
      <v-toolbar flat color="#424242">
        <v-toolbar-title>Tickets I already own</v-toolbar-title>
      </v-toolbar>
      <v-data-table
        :headers="headers"
        :items="tickets"
        :loading="loading"
        class="elevation-1"
        hide-actions
      >
        <template v-slot:items="props">
          <td>{{ randomTrain(props.item.train.name) }}</td>
          <td>{{ props.item.train.from }}</td>
          <td>{{ props.item.train.to }}</td>
          <td>{{ require('moment')(props.item.train.departure).calendar() }}</td>
          <td>{{ require('moment')(props.item.train.arrival).calendar() }}</td>
          <td>
            <v-btn
              :loading="loading"
              @click="sellTicket(props.item)"
              color="red"
              flat
              outline
              small
            >
              Get off train
              <v-icon right small>
                directions_walk
              </v-icon>
            </v-btn>
          </td>
        </template>
      </v-data-table>
    </div>
  </v-container>
</template>

<script>
import _ from 'lodash'

export default {
    data () {
        return {
            trains: [],
            tickets: [],
            emojis: ['🚞', '🚟', '🚂', '🚃', '🚄', '🚅', '🚆', '🚈', '🚉', '🚊', '🚋', '💺', '🚝', '🛤'], //replace with images?
            loading: true,
            headers: [
                { text: 'Train', value: 'name' },
                { text: 'From', value: 'from' },
                { text: 'To', value: 'to' },
                { text: 'Departure', value: 'departure' },
                { text: 'Arrival', value: 'arrival' },
            ].map(header => {
                return {
                    ...header,
                    align: 'left',
                    sortable: false,
                }
            })
        }
    },
    mounted () {
        this.getTickets();
        this.getUserTickets();
    },
    methods: {
          randomTrain(name) {
            return `${_.sample(this.emojis)} ${name}`;
          },
          alreadyOwns(train) {
            return this.tickets.map(t => t.train_id).includes(train.id);
          },
          async buyTicket(train) {
          this.loading = true;
          try {
            await this.$axios.post('/add-ticket', {
              train_id: train.id,
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
              train_id: ticket.train.id,
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
                const { data: trains } = await this.$axios.get('/trains');
                this.trains = trains;
            } catch (e) {
                // Snackbar?
            }
            this.loading = false;
        },
      async getUserTickets () {
            this.loading = true;
            try {
                const { data: userTickets } = await this.$axios.get('/my-tickets');
                this.tickets = userTickets;
            } catch (e) {
                // Snackbar?
            }
            this.loading = false;
        },
    }
}
</script>
