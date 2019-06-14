import random
import string
import requests
import piexif
from PIL import Image

from enochecker import *


def random_username():
    return ''.join(random.choice(string.ascii_letters) for i in range(20))


def random_password():
    rand_symbols = string.ascii_letters + string.digits
    return ''.join(random.choice(rand_symbols) for i in range(20))


def random_image():
    images = ['1.jpg', '3.jpg', '4.jpg', '5.jpg']
    return random.choice(images)


def random_train_id():
    return random.randint(1, 9)


class DerailedChecker(BaseChecker):
    port = 4303
    flag_count = 1
    noise_count = 1
    havoc_count = 1

    def url(self):
        return "http://"+self.address+":"+str(self.port)
        self.jwt_token = ''
        self.registered = False
        self.logged_in = False

    def putflag(self):
        try:
            if self.round == 0:
                pwd = self.register('Conductor')[1]
                self.team_db['CondPwd'] = pwd

            if self.flag_idx == 0:
                self.login('Conductor', self.team_db['CondPwd'])
                self.add_ticket()
            elif self.flag_idx == 1:
                username, password = self.register()
                self.login(username, password)
                self.input_flag_metadata()
                self.change_avatar()

        except Exception:
            raise EnoException(Exception)

    def getflag(self):
        try:
            if self.flag_idx == 0:
                self.login('Conductor', self.team_db['CondPwd'])
                self.get_tickets()
            elif self.flag_idx == 1:
                # TODO: get pic, read metadata
                pass

        except Exception:
            raise EnoException(Exception)

    def putnoise(self):
        rand_place = random.randint(0, 0)  # 0, 2
        if rand_place == 0:
            noise = random_username()*4
            username, password = self.register()
            self.login(username, password)
            self.add_ticket(noise)
        elif rand_place == 1:
            pass
        elif rand_place == 2:
            pass

    def getnoise(self):
        pass

    def havoc(self):
        methods = [self.register, self.check_trains, self.check_conductor_account, self.change_avatar]
        random.choice(methods)()

    def exploit(self):
        pass

    '''
    ####################
    #  HELPER METHODS  #
    ####################
    '''

    def register(self, username=None, password=None):
        if not username:
            username = random_username()
        if not password:
            password = random_password()

        data = {'username': username, 'password': password}
        header = {'User-Agent': self.http_useragent_randomize()}

        try:
            register = requests.post(self.derailed + "/auth/new", data=data, headers=header)
            if register.ok:
                self.team_db['Username'] = username
                self.team_db['Password'] = password
                self.registered = True
                self.info("Successfully registered account {}".format(username))
            else:
                raise BrokenServiceException('Could not register')
        except requests.exceptions.ConnectionError:
            raise OfflineException
        return [username, password]

    def login(self, username, password):
        data = {'username': username, 'password': password}
        header = {'User-Agent': self.http_useragent_randomize()}

        try:
            login = requests.post(self.derailed + "/auth", data=data, headers=header)
            if login.ok:
                jwt_token = login.headers['authorization']
                self.jwt_token = jwt_token
                self.team_db['JwtToken'] = jwt_token
                self.logged_in = True
            else:
                self.debug("Could not login as {}, code {}".format(username, login.status_code))
                raise BrokenServiceException("Problem occurred while logging in as {}".format(username))
        except Exception:
            raise EnoException("Problem occurred while logging in as {}".format(username))

    def add_ticket(self, noise=None):
        if self.registered is False:
            uname, pwd = self.register()
            self.login(uname, pwd)

        header = {'User-Agent': self.http_useragent_randomize(), 'Authorization': self.jwt_token}
        if noise:
            data = {'train_id': random_train_id(), 'ticket_id': noise}
        else:
            data = {'train_id': random_train_id(), 'ticket_id': self.flag}

        ticket_flag = requests.post(self.derailed + "/add-ticket", data=data, headers=header)
        if not ticket_flag.ok:
            raise BrokenServiceException("Could not add a ticket with the flag")

    def get_tickets(self):
        header = {'User-Agent': self.http_useragent_randomize(), 'Authorization': self.jwt_token}
        try:
            g = requests.get(self.derailed + "/my-tickets", headers=header)
            if self.flag not in g.text:
                raise BrokenServiceException("Flag not found")
            if not g.ok:
                raise BrokenServiceException("Could not retrieve tickets")
        except Exception:
            raise EnoException("Problem occurred while retrieving own ticket")

    def input_flag_metadata(self):
        zeroth_ifd = {
            piexif.ImageIFD.ImageDescription: self.flag
        }
        exif_dict = {"0th": zeroth_ifd}
        exit_bytes = piexif.dump(exif_dict)
        image = random_image()
        jpg_img = Image.open(image)
        jpg_img.save(image, exif=exit_bytes)

    def read_metadata(self):
        pass

    def change_avatar(self):
        if self.logged_in is False:
            uname, pwd = self.register()
            self.login(uname, pwd)

        header = {'User-Agent': self.http_useragent_randomize(), 'Authorization': self.jwt_token}
        files = {'avatar': open(random_image(), 'rb')}
        requests.post(self.derailed + "/user-avatar", files=files, headers=header)

    def get_avatar(self):
        # header = {'User-Agent': self.http_useragent_randomize(), 'Authorization': self.jwt_token}
        # g = requests.get(self.derailed + "/user-profile", headers=header, stream=True)
        pass

    def check_trains(self):
        if self.registered is False:
            uname, pwd = self.register()
            self.login(uname, pwd)

        header = {'User-Agent': self.http_useragent_randomize(), 'Authorization': self.jwt_token}
        trains = requests.get(self.derailed + "/trains", headers=header)

        if trains.text.count('id') != 9:
            raise BrokenServiceException("Number of trains does not match")
        if not trains.ok:
            raise BrokenServiceException("Could not get trains")

    def check_conductor_account(self):
        if not self.team_db['Conductor']:
            raise BrokenServiceException("Conductor account not found in db")


app = DerailedChecker.service
if __name__ == "__main__":
    run(DerailedChecker)

