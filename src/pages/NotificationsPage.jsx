import {
    useState,
} from 'react';

import {
    Bell,
    Image as ImageIcon,
    Send,
    X,
} from 'lucide-react';

import {
    sendPushNotification,
} from '../api/notificationApi';


export default function NotificationsPage() {
    const [
        title,
        setTitle,
    ] = useState('');

    const [
        description,
        setDescription,
    ] = useState('');

    const [
        imageUrl,
        setImageUrl,
    ] = useState('');

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        success,
        setSuccess,
    ] = useState('');

    const [
        error,
        setError,
    ] = useState('');


    /* ==================================================
       SEND
    ================================================== */

    const handleSend =
        async event => {
            event.preventDefault();


            if (
                !title.trim() ||
                !description.trim()
            ) {
                setError(
                    'Please enter title and description.',
                );

                return;
            }


            try {
                setLoading(true);

                setError('');
                setSuccess('');


                await sendPushNotification({
                    title:
                        title.trim(),

                    description:
                        description.trim(),

                    imageUrl:
                        imageUrl.trim(),
                });


                setSuccess(
                    'Notification sent successfully.',
                );


                setTitle('');
                setDescription('');
                setImageUrl('');

            } catch (err) {
                setError(
                    err?.message ||
                    'Unable to send notification.',
                );

            } finally {
                setLoading(false);
            }
        };


    return (
        <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">

                {/* HEADER */}

                <div className="mb-7">
                    <p className="text-xs font-bold tracking-wider text-orange-500 uppercase mb-2">
                        Communication
                    </p>

                    <h1 className="text-2xl font-extrabold text-gray-900">
                        Push Notifications
                    </h1>

                    <p className="text-sm text-gray-500 mt-2">
                        Send announcements and updates directly to dealers.
                    </p>
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

                    {/* ===================================
                        FORM
                    =================================== */}

                    <form
                        onSubmit={
                            handleSend
                        }
                        className="bg-white border border-gray-200 rounded-lg p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                                <Bell
                                    size={18}
                                    className="text-orange-500"
                                />
                            </div>

                            <div>
                                <h2 className="font-bold text-gray-900">
                                    Create Notification
                                </h2>

                                <p className="text-xs text-gray-500 mt-0.5">
                                    Broadcast to all dealers
                                </p>
                            </div>
                        </div>


                        {/* TITLE */}

                        <div className="mb-5">
                            <label className="block text-xs font-bold text-gray-700 mb-2">
                                TITLE
                            </label>

                            <input
                                type="text"
                                value={
                                    title
                                }
                                maxLength={
                                    80
                                }
                                onChange={
                                    event =>
                                        setTitle(
                                            event.target.value,
                                        )
                                }
                                placeholder="Enter notification title"
                                className="w-full h-11 px-4 border border-gray-200 rounded-md outline-none focus:border-orange-400 text-sm"
                            />

                            <div className="text-right text-[10px] text-gray-400 mt-1">
                                {title.length}/80
                            </div>
                        </div>


                        {/* DESCRIPTION */}

                        <div className="mb-5">
                            <label className="block text-xs font-bold text-gray-700 mb-2">
                                DESCRIPTION
                            </label>

                            <textarea
                                value={
                                    description
                                }
                                maxLength={
                                    250
                                }
                                rows={
                                    5
                                }
                                onChange={
                                    event =>
                                        setDescription(
                                            event.target.value,
                                        )
                                }
                                placeholder="Write notification message..."
                                className="w-full px-4 py-3 border border-gray-200 rounded-md outline-none focus:border-orange-400 resize-none text-sm"
                            />

                            <div className="text-right text-[10px] text-gray-400 mt-1">
                                {description.length}/250
                            </div>
                        </div>


                        {/* IMAGE */}

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-700 mb-2">
                                IMAGE URL
                                <span className="font-normal text-gray-400 ml-1">
                                    (optional)
                                </span>
                            </label>

                            <div className="relative">
                                <ImageIcon
                                    size={16}
                                    className="absolute left-3 top-3.5 text-gray-400"
                                />

                                <input
                                    type="url"
                                    value={
                                        imageUrl
                                    }
                                    onChange={
                                        event =>
                                            setImageUrl(
                                                event.target.value,
                                            )
                                    }
                                    placeholder="https://..."
                                    className="w-full h-11 pl-10 pr-10 border border-gray-200 rounded-md outline-none focus:border-orange-400 text-sm"
                                />

                                {imageUrl ? (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setImageUrl(
                                                '',
                                            )
                                        }
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-700"
                                    >
                                        <X
                                            size={17}
                                        />
                                    </button>
                                ) : null}
                            </div>
                        </div>


                        {/* MESSAGES */}

                        {error ? (
                            <div className="mb-4 px-4 py-3 rounded-md bg-red-50 border border-red-100 text-xs font-semibold text-red-600">
                                {error}
                            </div>
                        ) : null}


                        {success ? (
                            <div className="mb-4 px-4 py-3 rounded-md bg-green-50 border border-green-100 text-xs font-semibold text-green-700">
                                {success}
                            </div>
                        ) : null}


                        {/* SEND */}

                        <button
                            type="submit"
                            disabled={
                                loading
                            }
                            className="h-11 px-5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-md flex items-center justify-center gap-2 text-sm font-bold transition"
                        >
                            <Send
                                size={16}
                            />

                            {loading
                                ? 'Sending...'
                                : 'Send Notification'}
                        </button>
                    </form>


                    {/* ===================================
                        PREVIEW
                    =================================== */}

                    <div>
                        <p className="text-xs font-bold text-gray-500 mb-3">
                            PREVIEW
                        </p>

                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            {imageUrl ? (
                                <img
                                    src={
                                        imageUrl
                                    }
                                    alt=""
                                    className="w-full h-44 object-cover"
                                    onError={
                                        event => {
                                            event.currentTarget.style.display =
                                                'none';
                                        }
                                    }
                                />
                            ) : null}


                            <div className="p-4">
                                <div className="flex gap-3">
                                    <div className="w-9 h-9 flex-shrink-0 rounded-md bg-orange-500 flex items-center justify-center">
                                        <Bell
                                            size={17}
                                            className="text-white"
                                        />
                                    </div>


                                    <div>
                                        <p className="text-sm font-bold text-gray-900">
                                            {title ||
                                                'Notification title'}
                                        </p>

                                        <p className="text-xs leading-5 text-gray-500 mt-1">
                                            {description ||
                                                'Your notification message will appear here.'}
                                        </p>

                                        <p className="text-[10px] text-gray-400 mt-2">
                                            Surya Marketing · now
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <p className="text-[10px] leading-4 text-gray-400 mt-3">
                            Actual appearance can vary slightly between Android and iOS.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}