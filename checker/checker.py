import requests
from enochecker import BaseChecker, BrokenServiceException, run


class DerailedChecker(BaseChecker):

    def __init__(self):
        super().__init__()
        self.host = self._ip
        self.port = '8080'

    def put_flag(self):
        # TODO: put flag in the service
        try:
            self.connect()
            flag = self.generate_flag()
            requests.post('http://localhost:8080', data=flag)

        except BrokenServiceException:
            return BrokenServiceException
        finally:
            self.close()

        # move to sub-put_flag method
        self.debug("flag is {}".format(self.flag))
        self.http_post("/putflaghere", params={"flag": self.flag})

    def get_flag(self):
        # TODO: get the flag
        if not self.http_get("/getflag") == self.flag:
            raise BrokenServiceException("Oops, wrong flag")

    def put_noise(self):
        # TODO: put some noise
        with self.connect() as telnet:
            telnet.write(self.noise)

    def get_noise(self):
        # TODO: get some noise
        with self.connect() as telnet:
            telnet.write("gimmeflag\n")
            telnet.read_expect(self.noise)

    def connect(self):
        """
        auth = JWTAuth('secretToken')
        requests.get("http://jwt-protected.com", auth=auth)
        """
        super().connect()

    def havoc(self):
        pass

    def close(self):
        pass

    def register(self):
        pass

    def generate_flag(self):
        """
        flag = ENO{BASE64} with:
            flag = flagContent (12 bytes) + flagSignature (20 bytes)
            flagContent = roundId (4bytes) + entropy (8bytes)
            flagSignature = hmac(flagContent)
        """
    pass

