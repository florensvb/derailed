import os
import hmac
import socket
import hashlib
import random
import string
import requests
import piexif
from PIL import Image

from enochecker import *

image = '1.jpg'


def random_username():
    return ''.join(random.choice(string.ascii_letters) for i in range(20))


def random_password():
    rand_symbols = string.ascii_letters + string.digits
    return ''.join(random.choice(rand_symbols) for i in range(20))


class DerailedChecker(BaseChecker):
    port = 8888

    def __init__(self):
        super().__init__(round=random.randint(0, 0))
        self.address = socket.gethostbyname(socket.gethostname())
        self.host = 'http://127.0.0.1:'
        self.name = ''
        self.pwd = ''
        self.jwt_token = ''
        self.registered = False

    def putflag(self):
        try:
            if self.round == 0:
                pwd = self.register('Conductor')[1]
                self.login('Conductor', pwd)
                self.add_ticket()

            username, password = self.register()
            self.login(username, password)
            # put 2nd flag in jpg exif

        except Exception:
            raise EnoException(Exception)

    def getflag(self):
        if not self.http_get("/getflag") == self.flag:
            raise BrokenServiceException("Oops, wrong flag")

    def putnoise(self):
        rand_place = random.randint(0, 2)
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
        with self.connect() as telnet:
            telnet.write("gimmeflag\n")
            telnet.read_expect(self.noise)

    def havoc(self):
        methods = [self.register, self.get_trains, self.check_conductor_account]  # , self.change_avatar]
        random.choice(methods)()

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
            register = requests.post(self.host + str(self.port) + "/auth/new", data=data, headers=header)
            if register.ok:
                self.team_db['Username'] = username
                self.team_db['Password'] = password
                self.registered = True
                self.debug("Successfully registered account {}".format(username))
            else:
                raise BrokenServiceException('Could not register account {}'.format(username))
        except requests.exceptions.ConnectionError:
            raise OfflineException
        return [username, password]

    def login(self, username, password):
        data = {'username': username, 'password': password}
        header = {'User-Agent': self.http_useragent_randomize()}

        try:
            login = requests.post(self.host + str(self.port) + "/auth", data=data, headers=header)
            if login.ok:
                jwt_token = login.headers['authorization']
                self.jwt_token = jwt_token
                self.team_db['JwtToken'] = jwt_token
            else:
                self.debug("Could not login as {}, code {}".format(username, login.status_code))
                raise BrokenServiceException("Problem occurred while logging in as {}".format(username))
        except Exception:
            raise EnoException("Problem occurred while logging in as {}".format(username))

    def generate_flag(self):
        """
        flag = ENO{BASE64} with:
            flag = flagContent (12 bytes) + flagSignature (20 bytes)
            flagContent = roundId (4bytes) + entropy (8bytes)
            flagSignature = hmac(flagContent)
        """
        flag_content = bytes([self.round]) + os.urandom(8)  # round_id + entropy
        rand_key = str(random.randint(0, 99)).encode()
        flag_signature = hmac.new(rand_key, flag_content, hashlib.sha256).hexdigest()

        flag = "ENO" + flag_content.hex() + flag_signature
        self.flag = flag
        self.team_db['Flag'] = flag
        return flag

    def add_ticket(self, noise=None):
        if self.registered is False:
            self.register()

        header = {'User-Agent': self.http_useragent_randomize(), 'Authorization': self.jwt_token}
        if noise:
            data = {'train_id': random_train_id(), 'ticket_id': noise}
        else:
            data = {'train_id': random_train_id(), 'ticket_id': self.generate_flag()}

        ticket_flag = requests.post(self.host + str(self.port) + "/add-ticket", data=data, headers=header)
        if not ticket_flag.ok:
            raise BrokenServiceException("Could not add a ticket with the flag")

        # TODO move this check to another method
        try:
            g = requests.get(self.host + str(self.port) + "/my-tickets", data=data, headers=header)
            if not g.ok:
                raise BrokenServiceException("Could not retrieve tickets")
        except Exception:
            raise EnoException("Problem occurred while retrieving own ticket")

    def get_trains(self):
        if self.registered is False:
            self.register()

        header = {'User-Agent': self.http_useragent_randomize(), 'Authorization': self.jwt_token}
        trains = requests.get(self.host + str(self.port) + "/trains", headers=header)

        if trains.text.count('id') != 9:
            raise BrokenServiceException("Number of trains does not match")
        if not trains.ok:
            raise BrokenServiceException("Could not get trains")

    def input_flag_metadata(self):
        zeroth_ifd = {
            piexif.ImageIFD.ImageDescription: self.generate_flag()
        }
        exif_dict = {"0th": zeroth_ifd}
        exit_bytes = piexif.dump(exif_dict)
        jpg_img = Image.open(image)
        jpg_img.save("test.jpg", exif=exit_bytes)

    def change_avatar(self):
        # TODO only after log in, so callable from havoc
        header = {'User-Agent': self.http_useragent_randomize(), 'Authorization': self.jwt_token}
        files = {'avatar': open(image, 'rb')}
        requests.post(self.host + str(self.port) + "/user-avatar", files=files, headers=header)

    def get_avatar(self):
        # header = {'User-Agent': self.http_useragent_randomize(), 'Authorization': self.jwt_token}
        # g = requests.get(self.host + str(self.port) + "/user-profile", headers=header, stream=True)
        pass

    def check_conductor_account(self):
        if not self.team_db['Conductor']:
            raise BrokenServiceException("Conductor account not found in db")


def random_train_id():
    return random.randint(1, 9)


if __name__ == "__main__":
    # run(DerailedChecker)
    checker = DerailedChecker()
    # checker.generate_flag()
    # checker.get_trains()
    # name, pwd = checker.register()
    # checker.login('test', 'test123')
    # checker.add_ticket()
    # checker.add_indexer()
    checker.input_flag_metadata()
    # checker.change_avatar()
    # checker.get_avatar()
    # read_metadata()
    # checker.putflag()
    # checker.putnoise()
    # checker.havoc()
