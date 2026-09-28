import { useRef, useState } from 'react'
import emailjs from '@emailjs/browser'

function Contact() {

  const form = useRef()

  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)

  const sendEmail = (e) => {
    e.preventDefault()

    setSending(true)
    setSuccess(false)
    setError(false)

    emailjs.sendForm(
      'service_hcnn57l',
      'template_ni9ryl2',
      form.current,
      {
        publicKey: 'sFUXsZWP52wA-ICvd',
      }
    )
    .then(
      () => {
        setSending(false)
        setSuccess(true)
        e.target.reset()
      },
      (error) => {
        console.log('FAILED...', error.text)

        setSending(false)
        setError(true)
      }
    )
  }

  return (
    <section id="contact" className="py-16 bg-blue-900 text-white">

      <div className="container mx-auto px-4">

        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Contact Us
          </h2>

          <div className="w-24 h-1 bg-yellow-400 mx-auto mb-4"></div>
        </div>


        <div className="grid md:grid-cols-2 gap-12">

          {/* LEFT SIDE */}

          <div>

            <h3 className="text-2xl font-semibold mb-6 text-yellow-300">
              Get In Touch
            </h3>

            <div className="space-y-6">

              {[
                ["📍", "Address", "Olorunda Road,\nIdiagbon, Ogun."],
                ["📞", "Phone", "+234 805 6871 952"],
                ["✉️", "Email", "olufunmilayoadegbenro@gmail.com"],
                ["🕒", "Office Hours", "Mon–Fri: 8:00 AM – 4:00 PM"]
              ].map(([icon, label, value]) => (

                <div
                  key={label}
                  className="flex items-start space-x-4"
                >

                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">

                    <span className="text-blue-900">
                      {icon}
                    </span>

                  </div>

                  <div>

                    <h4 className="font-semibold text-yellow-200">
                      {label}
                    </h4>

                    <p className="text-blue-200 whitespace-pre-line">
                      {value}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          </div>



          <div>

            <h3 className="text-2xl font-semibold mb-6 text-yellow-300">
              Send us a Message
            </h3>


            <form
              ref={form}
              onSubmit={sendEmail}
              className="space-y-4"
            >


              <div className="grid md:grid-cols-2 gap-4">

                <div>

                  <label className="block text-yellow-200 mb-2">
                    First Name
                  </label>

                  <input
                    type="text"
                    name="first_name"
                    className="w-full px-4 py-2 bg-blue-800 border border-blue-700 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-yellow-400"
                    placeholder="Your first name"
                    required
                  />

                </div>


                <div>

                  <label className="block text-yellow-200 mb-2">
                    Last Name
                  </label>

                  <input
                    type="text"
                    name="last_name"
                    className="w-full px-4 py-2 bg-blue-800 border border-blue-700 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-yellow-400"
                    placeholder="Your last name"
                    required
                  />

                </div>

              </div>



              <div>

                <label className="block text-yellow-200 mb-2">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  className="w-full px-4 py-2 bg-blue-800 border border-blue-700 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-yellow-400"
                  placeholder="your.email@example.com"
                  required
                />

              </div>



              <div>

                <label className="block text-yellow-200 mb-2">
                  Message
                </label>

                <textarea
                  rows={5}
                  name="message"
                  className="w-full px-4 py-2 bg-blue-800 border border-blue-700 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-yellow-400 resize-none"
                  placeholder="Tell us how we can help you..."
                  required
                ></textarea>

              </div>



              {success && (
                <div className="bg-green-500 text-white p-3 rounded-lg">
                  Message sent successfully! We'll get back to you soon.
                </div>
              )}



              {error && (
                <div className="bg-red-500 text-white p-3 rounded-lg">
                  Something went wrong. Please try again.
                </div>
              )}



              <button
                type="submit"
                disabled={sending}
                className="w-full bg-yellow-400 text-blue-900 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors disabled:opacity-50"
              >

                {sending ? "Sending..." : "Send Message"}

              </button>

            </form>

          </div>

        </div>

      </div>

    </section>
  )
}

export default Contact