from time import sleep

class Secret: 
    def __init__(self, secret_message, hours_ttl, minutes_ttl, uuid): 
        self.secret_message = secret_message 
        self.hours_ttl = hours_ttl 
        self.minutes_ttl = minutes_ttl
        self.uuid = uuid
            
    def startTimer(self, secrets):
        sleep((60 * 60 * self.hours_ttl) + (60 * self.minutes_ttl))
        try:
            secrets.pop(self.uuid) 
        except: 
            pass 

    def getSecret(self): 
        return self.secret_message
