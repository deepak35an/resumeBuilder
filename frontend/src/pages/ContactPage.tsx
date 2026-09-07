import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { breadcrumbJsonLd, Seo, webPageJsonLd } from '@/components/seo/Seo';
import { Alert, Button, Field, Input, Textarea } from '@/components/ui';
import { errorMessage } from '@/lib/api-client';
import { config } from '@/lib/config';
import { contentService } from '@/services/content.service';
import { toast } from '@/store/toast';

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your name.'),
  email: z.string().email('Enter a valid email address.'),
  subject: z.string().trim().min(3, 'Enter a subject.'),
  message: z.string().trim().min(10, 'Write a little more so we can help.'),
});

type Values = z.infer<typeof schema>;

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', subject: '', message: '' },
  });

  return (
    <>
      <Seo
        title="Contact"
        description="Contact ResumeForge about the product, privacy or a problem with your account."
        path="/contact"
        jsonLd={[
          webPageJsonLd({
            name: 'Contact',
            description: 'Get in touch with ResumeForge.',
            path: '/contact',
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Contact', path: '/contact' },
          ]),
        ]}
      />
      <article className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Contact</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          For account or privacy requests, email{' '}
          <a className="link-underline" href={`mailto:${config.supportEmail}`}>
            {config.supportEmail}
          </a>
          . The form below is for product questions.
        </p>

        {isSubmitSuccessful && (
          <Alert tone="success" className="mt-6">
            Thanks — we received your message.
          </Alert>
        )}

        <form
          className="mt-8 space-y-4"
          noValidate
          onSubmit={handleSubmit(async (values) => {
            try {
              await contentService.contact(values);
              reset();
              toast.success('Message sent');
            } catch (error) {
              toast.error('Could not send that message', errorMessage(error));
              throw error;
            }
          })}
        >
          <Field label="Name" error={errors.name?.message}>
            <Input {...register('name')} autoComplete="name" />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <Input {...register('email')} type="email" autoComplete="email" />
          </Field>
          <Field label="Subject" error={errors.subject?.message}>
            <Input {...register('subject')} />
          </Field>
          <Field label="Message" error={errors.message?.message}>
            <Textarea {...register('message')} minRows={6} />
          </Field>
          <Button type="submit" loading={isSubmitting}>
            Send message
          </Button>
        </form>
      </article>
    </>
  );
}
